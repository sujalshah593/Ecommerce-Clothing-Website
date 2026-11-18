import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../Models/Order.js";
import Product from "../Models/Product.js";
import Cart from "../Models/Cart.js";
import WebhookEvent from "../Models/WebhookEvent.js";
import InventoryReservation from "../Models/InventoryReservation.js";
import razorpay from "../Config/razorpay.js";
import orderEmailTemplate from "../utils/orderEmailTemplate.js";
import { enqueueEmail } from "../Queue/emailQueue.js";
import { scheduleReservationExpiry } from "../Queue/reservationExpiryQueue.js";
import {
  checkoutFingerprint,
  reconcileRazorpayOrder,
  razorpayReceiptForOrder,
} from "../Services/paymentAttemptService.js";
import {
  ReservationError,
  RESERVATION_RELEASE_REASONS,
  attachRazorpayOrderToReservation,
  confirmReservation,
  releaseReservation,
  reserveInventory,
} from "../Services/inventoryReservationService.js";

const TAX_RATE = 0.1;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

const getValidatedOrderData = async (items, { checkAvailableStock = true } = {}) => {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("No order items"); error.status = 400; throw error;
  }
  const normalizedItems = items.map((item) => {
    if (!mongoose.isValidObjectId(item.product) || !Number.isInteger(item.qty) || item.qty < 1) {
      const error = new Error("Invalid product or quantity"); error.status = 400; throw error;
    }
    return { product: item.product, qty: item.qty };
  });
  const products = await Product.find({ _id: { $in: normalizedItems.map((item) => item.product) } });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));
  const orderItems = normalizedItems.map(({ product, qty }) => {
    const productRecord = productMap.get(product.toString());
    if (!productRecord) { const error = new Error("Product not found"); error.status = 404; throw error; }
    if (checkAvailableStock && qty > productRecord.countInStock) {
      const error = new Error(`${productRecord.name} is out of stock or has insufficient stock`); error.status = 400; throw error;
    }
    return { name: productRecord.name, qty, image: productRecord.image, price: productRecord.price, product: productRecord._id };
  });
  const subtotal = orderItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const totalPrice = subtotal + Math.round(subtotal * TAX_RATE);
  if (!Number.isFinite(totalPrice) || totalPrice <= 0) { const error = new Error("Invalid order amount"); error.status = 400; throw error; }
  return { orderItems, totalPrice };
};

const sendPaymentConfirmation = async (order, user) => {
  // Atomically claim the right to send this confirmation.
  // If another path (webhook or verify-payment) already claimed it, skip.
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, paymentConfirmationSent: false },
    { $set: { paymentConfirmationSent: true } },
    { new: true },
  );
  if (!claimed) return;
  // Use a deterministic jobId so that even if enqueueEmail is called
  // again for the same order (e.g. retry edge case), BullMQ rejects
  // the duplicate and does not send a second email.
  await enqueueEmail(
    "payment-confirmation",
    { to: user.email, subject: "Order Confirmation - Shreeji Store", html: orderEmailTemplate({ user, order: claimed }) },
    { jobId: `payment-confirmation-${order._id}` }
  );
};

const handleError = (res, error, fallback) => {
  console.error(`${fallback}:`, error);
  res.status(error.status || 500).json({ message: error.status ? error.message : fallback });
};

const getPaymentOrderResponse = (order, reservation) => ({
  localOrderId: order._id,
  razorpayOrderId: order.razorpayOrderId,
  reservationId: reservation.reservationId,
  reservationExpiresAt: reservation.expiresAt,
  amount: Math.round(order.totalPrice * 100),
  currency: "INR",
  keyId: process.env.RAZORPAY_KEY_ID,
});

const getReservationForOrder = (orderId) => InventoryReservation.findOne({ order: orderId });

const paymentAmountMatches = (order, payment) =>
  Number(payment?.amount) === Math.round(order.totalPrice * 100) && payment?.currency === "INR";

const linkRazorpayOrder = async ({ order, reservation, razorpayOrderId }) => runTransaction(async (session) => {
  const linkedReservation = await attachRazorpayOrderToReservation({
    reservationId: reservation.reservationId,
    order: order._id,
    razorpayOrderId,
    session,
  });
  const linkedOrder = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: "pending", $or: [{ razorpayOrderId: { $exists: false } }, { razorpayOrderId }] },
    { $set: { razorpayOrderId } },
    { new: true, session },
  );
  if (!linkedOrder) {
    const error = new Error("Unable to link the Razorpay order to this checkout");
    error.status = 409;
    throw error;
  }
  return { order: linkedOrder, reservation: linkedReservation };
});

const reconcileAndLinkRazorpayOrder = async ({ order, reservation }) => {
  const providerOrder = await reconcileRazorpayOrder({ razorpay, order });
  if (!providerOrder) return null;
  return linkRazorpayOrder({ order, reservation, razorpayOrderId: providerOrder.id });
};

const markLatePaymentForReconciliation = async (orderId, paymentData, session) => {
  return Order.findOneAndUpdate(
    { _id: orderId, paymentStatus: { $ne: "paid" } },
    {
      $set: {
        paymentStatus: "reconciliation_required",
        lastPaymentEvent: paymentData.event,
        paymentReconciliation: {
          required: true,
          reason: "payment_received_after_reservation_release",
          paymentId: paymentData.razorpayPaymentId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          recordedAt: new Date(),
        },
      },
      $addToSet: { paymentEvents: { eventId: paymentData.eventId, event: paymentData.event, status: paymentData.status } },
    },
    { new: true, session },
  ).populate("user");
};

const reserveOrderInventory = async (order, session) => {
  if (order.inventoryDeducted) return;
  for (const item of order.orderItems) {
    const product = await Product.findOneAndUpdate(
      { _id: item.product, countInStock: { $gte: item.qty } },
      { $inc: { countInStock: -item.qty } },
      { new: true, session },
    );
    if (!product) {
      const error = new Error("One or more products are out of stock");
      error.status = 409;
      throw error;
    }
  }
  order.inventoryDeducted = true;
  await order.save({ session });
};

const runTransaction = async (operation) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

const waitForRazorpayOrder = async (orderId, userId) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const order = await Order.findOne({ _id: orderId, user: userId, paymentMethod: "RAZORPAY" });
    if (!order) return null;
    if (order.razorpayOrderId || order.paymentStatus === "failed") return order;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return Order.findOne({ _id: orderId, user: userId, paymentMethod: "RAZORPAY" });
};

export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod = "COD" } = req.body;
    const { orderItems: validatedItems, totalPrice } = await getValidatedOrderData(orderItems);
    if (paymentMethod.toUpperCase() !== "COD") return res.status(400).json({ message: "Use /api/orders/payment-order for online payments" });
    const createdOrder = await runTransaction(async (session) => {
      const [order] = await Order.create([{ user: req.user._id, orderItems: validatedItems, shippingAddress, totalPrice, paymentMethod: "COD", paymentStatus: "pending", isPaid: false, inventoryDeducted: false, statusHistory: [{ status: "Placed" }] }], { session });
      await reserveOrderInventory(order, session);
      await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } }, { session });
      return order;
    });
    // Fire-and-forget: enqueue COD order confirmation.
    // The order is already created and committed; email is a non-critical side effect.
    await enqueueEmail(
      "cod-order-confirmation",
      { to: req.user.email, subject: "Order Confirmation - Shreeji Store", html: orderEmailTemplate({ user: req.user, order: createdOrder }) },
      { jobId: `cod-order-confirmation-${createdOrder._id}` }
    );
    res.status(201).json(createdOrder);
  } catch (error) { handleError(res, error, "Order creation failed"); }
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress } = req.body;
    const idempotencyKey = req.get("Idempotency-Key");
    if (!idempotencyKey || !IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
      return res.status(400).json({ message: "A valid Idempotency-Key header is required" });
    }

    const { orderItems: validatedItems, totalPrice } = await getValidatedOrderData(orderItems, { checkAvailableStock: false });
    const requestFingerprint = checkoutFingerprint({
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod: "RAZORPAY",
      totalPrice,
    });
    let localOrder;
    try {
      localOrder = await Order.create({ user: req.user._id, orderItems: validatedItems, shippingAddress, totalPrice, paymentMethod: "RAZORPAY", paymentStatus: "pending", isPaid: false, inventoryDeducted: false, idempotencyKey, checkoutFingerprint: requestFingerprint, statusHistory: [{ status: "Placed" }] });
    } catch (error) {
      if (error.code !== 11000) throw error;
      localOrder = await Order.findOne({ user: req.user._id, paymentMethod: "RAZORPAY", idempotencyKey });
      if (!localOrder) throw error;
    }

    const existingFingerprint = localOrder.checkoutFingerprint || checkoutFingerprint({
      orderItems: localOrder.orderItems,
      shippingAddress: localOrder.shippingAddress,
      paymentMethod: localOrder.paymentMethod,
      totalPrice: localOrder.totalPrice,
    });
    if (existingFingerprint !== requestFingerprint) {
      return res.status(409).json({ code: "IDEMPOTENCY_KEY_REUSED", message: "This checkout key was already used for a different checkout request." });
    }
    if (localOrder.paymentStatus === "paid") return res.status(409).json({ message: "Payment attempt is already completed" });
    if (["failed", "reconciliation_required"].includes(localOrder.paymentStatus)) {
      return res.status(409).json({ message: "Payment attempt cannot continue. Start a new checkout attempt." });
    }

    const reservationResult = await reserveInventory({
      customer: req.user._id,
      order: localOrder._id,
      items: localOrder.orderItems,
      idempotencyKey,
    });
    let reservation = reservationResult.reservation;
    if (reservation.status !== "active") {
      return res.status(409).json({ message: "Payment attempt cannot continue. Start a new checkout attempt." });
    }
    // Scheduling happens after the reservation transaction commits. If Redis is unavailable,
    // recovery scans MongoDB and schedules/releases this reservation later.
    await scheduleReservationExpiry({ reservationId: reservation.reservationId, expiresAt: reservation.expiresAt });
    if (localOrder.razorpayOrderId) return res.status(200).json(getPaymentOrderResponse(localOrder, reservation));

    // A prior provider call may have succeeded while its response was lost. Reconcile
    // the provider's unique receipt before deciding whether a new creation is safe.
    if (localOrder.razorpayOrderCreationStartedAt) {
      try {
        const reconciled = await reconcileAndLinkRazorpayOrder({ order: localOrder, reservation });
        if (reconciled) return res.status(200).json(getPaymentOrderResponse(reconciled.order, reconciled.reservation));
      } catch (error) {
        console.error("Razorpay order reconciliation failed:", error.message);
        return res.status(error.status || 503).json({
          code: "PAYMENT_ORDER_RECONCILIATION_PENDING",
          message: "Unable to confirm the existing payment attempt. Please retry shortly.",
        });
      }
      return res.status(409).json({
        code: "PAYMENT_ORDER_RECONCILIATION_PENDING",
        message: "Payment order creation is still being reconciled. Please retry shortly.",
      });
    }

    const claimedOrder = await Order.findOneAndUpdate(
      { _id: localOrder._id, paymentStatus: "pending", razorpayOrderId: { $exists: false }, razorpayOrderCreationStartedAt: { $exists: false } },
      { $set: { razorpayOrderCreationStartedAt: new Date() } },
      { new: true },
    );
    if (!claimedOrder) {
      const readyOrder = await waitForRazorpayOrder(localOrder._id, req.user._id);
      const readyReservation = await getReservationForOrder(localOrder._id);
      if (readyOrder?.razorpayOrderId && readyReservation) return res.status(200).json(getPaymentOrderResponse(readyOrder, readyReservation));
      return res.status(409).json({ message: "Payment attempt is being created. Retry with the same Idempotency-Key." });
    }

    try {
      const razorpayOrder = await razorpay.orders.create({ amount: Math.round(totalPrice * 100), currency: "INR", receipt: razorpayReceiptForOrder(localOrder._id) });
      const linked = await linkRazorpayOrder({ order: localOrder, reservation, razorpayOrderId: razorpayOrder.id });
      res.status(201).json(getPaymentOrderResponse(linked.order, linked.reservation));
    } catch (error) {
      try {
        const reconciled = await reconcileAndLinkRazorpayOrder({ order: localOrder, reservation });
        if (reconciled) return res.status(200).json(getPaymentOrderResponse(reconciled.order, reconciled.reservation));
      } catch (reconciliationError) {
        console.error("Razorpay post-error reconciliation failed:", reconciliationError.message);
      }
      const definitelyFailed = Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode < 500;
      if (definitelyFailed) {
        await releaseReservation({ reservationId: reservation.reservationId, reason: RESERVATION_RELEASE_REASONS.RAZORPAY_ORDER_CREATION_FAILED });
        await Order.updateOne({ _id: localOrder._id, paymentStatus: "pending" }, { $set: { paymentStatus: "failed" } });
      }
      throw error;
    }
  } catch (error) { handleError(res, error, "Unable to create payment order"); }
};

const processPaymentSuccess = async (orderId, paymentData, session) => {
  const paymentOrder = await Order.findById(orderId).session(session);
  if (!paymentOrder) {
    const error = new Error("Order not found"); error.status = 404; throw error;
  }
  if (!paymentAmountMatches(paymentOrder, paymentData)) {
    const error = new Error("Razorpay payment amount or currency mismatch"); error.status = 400; throw error;
  }
  if (paymentOrder.isPaid) {
    if (paymentOrder.razorpayPaymentId === paymentData.razorpayPaymentId) return { order: paymentOrder, alreadyProcessed: true };
    const error = new Error("Order has already been paid"); error.status = 409; throw error;
  }
  if (paymentOrder.razorpayOrderId !== paymentData.razorpayOrderId) {
    const error = new Error("Razorpay order mismatch"); error.status = 400; throw error;
  }
  const reservation = await getReservationForOrder(paymentOrder._id).session(session);
  if (!reservation) {
    const error = new Error("Inventory reservation not found"); error.status = 409; throw error;
  }

  try {
    await confirmReservation({ reservationId: reservation.reservationId, order: paymentOrder._id, razorpayOrderId: paymentData.razorpayOrderId, session });
  } catch (error) {
    if (error instanceof ReservationError && ["RESERVATION_RELEASED", "RESERVATION_EXPIRED"].includes(error.code)) {
      const reconciliationOrder = await markLatePaymentForReconciliation(paymentOrder._id, paymentData, session);
      return { order: reconciliationOrder, latePayment: true };
    }
    throw error;
  }
  const paymentEvent = { event: paymentData.event, status: paymentData.status };
  if (paymentData.eventId) paymentEvent.eventId = paymentData.eventId;

  const updatePayload = {
    $set: { 
      isPaid: true, 
      paymentStatus: "paid", 
      paidAt: new Date(), 
      razorpayPaymentId: paymentData.razorpayPaymentId,
      lastPaymentEvent: paymentData.event 
    },
    $push: { paymentEvents: paymentEvent }
  };
  if (paymentData.razorpaySignature) updatePayload.$set.razorpaySignature = paymentData.razorpaySignature;

  const finalOrder = await Order.findOneAndUpdate(
    { _id: paymentOrder._id, isPaid: false, paymentStatus: "pending" },
    updatePayload,
    { new: true, session },
  ).populate("user");

  if (finalOrder) {
    await Cart.updateOne({ user: finalOrder.user._id }, { $set: { items: [] } }, { session });
  }

  return { order: finalOrder, alreadyProcessed: false };
};

export const verifyPayment = async (req, res) => {
  try {
    const { localOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!mongoose.isValidObjectId(localOrderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findOne({ _id: localOrderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === "paid") {
      if (order.razorpayPaymentId === razorpay_payment_id) return res.json({ success: true, alreadyProcessed: true, order });
      return res.status(409).json({ message: "Order has already been paid" });
    }
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) return res.status(400).json({ message: "Razorpay order mismatch" });
    
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (!razorpay_signature || expectedSignature.length !== razorpay_signature.length || !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))) return res.status(400).json({ message: "Invalid payment signature" });

    const gatewayPayment = await razorpay.payments.fetch(razorpay_payment_id);
    if (gatewayPayment.order_id !== razorpay_order_id || !paymentAmountMatches(order, gatewayPayment)) {
      return res.status(400).json({ message: "Razorpay payment amount, currency, or order mismatch" });
    }
    
    const paymentResult = await runTransaction(async (session) => {
      return await processPaymentSuccess(order._id, {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        razorpayOrderId: razorpay_order_id,
        event: "payment.captured",
        status: gatewayPayment.status,
        amount: gatewayPayment.amount,
        currency: gatewayPayment.currency,
      }, session);
    });

    if (paymentResult.latePayment) {
      return res.status(409).json({ success: false, code: "PAYMENT_RECONCILIATION_REQUIRED", message: "Payment received after the inventory reservation ended. Support will reconcile this payment.", order: paymentResult.order });
    }
    if (paymentResult.alreadyProcessed) return res.json({ success: true, alreadyProcessed: true, order: paymentResult.order });
    
    await sendPaymentConfirmation(paymentResult.order, req.user);
    res.json({ success: true, order: paymentResult.order });
  } catch (error) { handleError(res, error, "Payment verification failed"); }
};

export const orderWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret || !signature || !Buffer.isBuffer(req.body)) return res.status(400).json({ message: "Webhook is not configured" });
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(req.body).digest("hex");
    if (expectedSignature.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) return res.status(400).json({ message: "Invalid webhook signature" });
    
    const payload = JSON.parse(req.body.toString("utf8"));
    const eventId = req.headers["x-razorpay-event-id"] || payload.id;
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;
    
    if (typeof eventId !== "string" || !eventId.trim() || eventId.length > 200 || !event || !payment?.order_id) {
      return res.status(400).json({ message: "Invalid webhook event" });
    }

    let updatedOrder;
    try {
      updatedOrder = await runTransaction(async (session) => {
        await WebhookEvent.create([{ eventId, event }], { session });

        const order = await Order.findOne({ razorpayOrderId: payment.order_id }).session(session);
        if (!order || !["payment.captured", "order.paid", "payment.failed"].includes(event)) {
          await WebhookEvent.updateOne({ eventId }, { $set: { status: "processed", processedAt: new Date() } }, { session });
          return null;
        }

        let processedOrder = null;
        let wasUnpaid = false;

        if (event === "payment.captured" || event === "order.paid") {
          if (!order.isPaid) {
            wasUnpaid = true;
            const paymentResult = await processPaymentSuccess(order._id, {
              razorpayPaymentId: payment.id,
              razorpayOrderId: payment.order_id,
              eventId,
              event,
              status: payment.status,
              amount: payment.amount,
              currency: payment.currency,
            }, session);
            processedOrder = paymentResult.order;
            wasUnpaid = !paymentResult.alreadyProcessed && !paymentResult.latePayment;
          }
        }

        if (event === "payment.failed" && !order.isPaid) {
          const reservation = await getReservationForOrder(order._id).session(session);
          if (reservation) {
            try {
              await releaseReservation({
                reservationId: reservation.reservationId,
                reason: RESERVATION_RELEASE_REASONS.PAYMENT_FAILED,
                session,
              });
            } catch (error) {
              if (!(error instanceof ReservationError && error.code === "RESERVATION_CONFIRMED")) throw error;
            }
          }
        }
        
        if (!processedOrder) {
          const update = { $set: { lastPaymentEvent: event }, $push: { paymentEvents: { eventId, event, status: payment.status } } };
          if (event === "payment.failed" && !order.isPaid) update.$set.paymentStatus = "failed";
          processedOrder = await Order.findByIdAndUpdate(order._id, update, { new: true, session }).populate("user");
          wasUnpaid = false;
        }

        await WebhookEvent.updateOne({ eventId }, { $set: { status: "processed", processedAt: new Date() } }, { session });
        return { order: processedOrder, wasUnpaid };
      });
    } catch (error) {
      if (error.code === 11000) return res.json({ received: true, alreadyProcessed: true });
      throw error;
    }

    if (updatedOrder?.order?.isPaid && updatedOrder.wasUnpaid) {
      await sendPaymentConfirmation(updatedOrder.order, updatedOrder.order.user);
    }
    res.json({ received: true });
  } catch (error) { 
    console.error("Razorpay webhook error:", error); 
    res.status(400).json({ message: "Webhook processing failed" }); 
  }
};

export const getAllOrders = async (req, res) => {
  try { res.json(await Order.find().populate("user", "name email").sort({ createdAt: -1 })); }
  catch (error) { res.status(500).json({ message: "Failed to fetch orders" }); }
};

export const getMyOrders = async (req, res) => {
  try { res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); }
  catch (error) { res.status(500).json({ message: "Failed to fetch my orders" }); }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = req.body.status;
    order.statusHistory.push({ status: req.body.status, date: new Date() });
    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (error) { res.status(500).json({ message: "Failed to update order status" }); }
};
