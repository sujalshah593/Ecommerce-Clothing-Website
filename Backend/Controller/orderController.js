import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../Models/Order.js";
import Product from "../Models/Product.js";
import WebhookEvent from "../Models/WebhookEvent.js";
import razorpay from "../Config/razorpay.js";
import orderEmailTemplate from "../utils/orderEmailTemplate.js";
import { sendEmail } from "../utils/sendEmail.js";

const TAX_RATE = 0.1;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const PAYMENT_ORDER_CREATION_TIMEOUT_MS = 2 * 60 * 1000;

const getValidatedOrderData = async (items) => {
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
    if (qty > productRecord.countInStock) {
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
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, paymentConfirmationSent: false },
    { $set: { paymentConfirmationSent: true } },
    { new: true },
  );
  if (!claimed) return;
  await sendEmail({ to: user.email, subject: "Order Confirmation - Shreeji Store", html: orderEmailTemplate({ user, order: claimed }) });
};

const handleError = (res, error, fallback) => {
  console.error(`${fallback}:`, error);
  res.status(error.status || 500).json({ message: error.status ? error.message : fallback });
};

const getPaymentOrderResponse = (order) => ({
  localOrderId: order._id,
  razorpayOrderId: order.razorpayOrderId,
  amount: Math.round(order.totalPrice * 100),
  currency: "INR",
  keyId: process.env.RAZORPAY_KEY_ID,
});

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

const expireStalePaymentAttempt = async (order, userId) => {
  if (order.razorpayOrderId || order.paymentStatus !== "pending") return order;
  const cutoff = new Date(Date.now() - PAYMENT_ORDER_CREATION_TIMEOUT_MS);
  if (!order.updatedAt || order.updatedAt >= cutoff) return order;
  return Order.findOneAndUpdate(
    {
      _id: order._id,
      user: userId,
      paymentMethod: "RAZORPAY",
      paymentStatus: "pending",
      razorpayOrderId: { $exists: false },
      updatedAt: { $lt: cutoff },
    },
    { $set: { paymentStatus: "failed" } },
    { new: true },
  );
};

export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod = "COD" } = req.body;
    const { orderItems: validatedItems, totalPrice } = await getValidatedOrderData(orderItems);
    if (paymentMethod.toUpperCase() !== "COD") return res.status(400).json({ message: "Use /api/orders/payment-order for online payments" });
    const createdOrder = await runTransaction(async (session) => {
      const [order] = await Order.create([{ user: req.user._id, orderItems: validatedItems, shippingAddress, totalPrice, paymentMethod: "COD", paymentStatus: "pending", isPaid: false, inventoryDeducted: false, statusHistory: [{ status: "Placed" }] }], { session });
      await reserveOrderInventory(order, session);
      return order;
    });
    await sendEmail({ to: req.user.email, subject: "Order Confirmation - Shreeji Store", html: orderEmailTemplate({ user: req.user, order: createdOrder }) });
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

    const existingOrder = await Order.findOne({ user: req.user._id, paymentMethod: "RAZORPAY", idempotencyKey });
    if (existingOrder) {
      if (existingOrder.paymentStatus === "paid") {
        return res.status(409).json({ message: "Payment attempt is already completed" });
      }
      if (existingOrder.paymentStatus === "failed") {
        return res.status(409).json({ message: "Payment attempt has failed. Start a new checkout attempt." });
      }
      const readyOrder = existingOrder.razorpayOrderId
        ? existingOrder
        : await waitForRazorpayOrder(existingOrder._id, req.user._id);
      if (readyOrder?.razorpayOrderId) return res.status(200).json(getPaymentOrderResponse(readyOrder));
      const expiredOrder = await expireStalePaymentAttempt(readyOrder || existingOrder, req.user._id);
      if (expiredOrder?.paymentStatus === "failed") {
        return res.status(409).json({ code: "PAYMENT_ATTEMPT_EXPIRED", message: "Payment attempt expired. Start a new checkout attempt." });
      }
      return res.status(409).json({ message: "Payment attempt is still being created. Retry with the same Idempotency-Key." });
    }

    const { orderItems: validatedItems, totalPrice } = await getValidatedOrderData(orderItems);
    let localOrder;
    try {
      localOrder = await Order.create({ user: req.user._id, orderItems: validatedItems, shippingAddress, totalPrice, paymentMethod: "RAZORPAY", paymentStatus: "pending", isPaid: false, idempotencyKey, statusHistory: [{ status: "Placed" }] });
    } catch (error) {
      if (error.code !== 11000) throw error;
      const concurrentOrderRecord = await Order.findOne({ user: req.user._id, paymentMethod: "RAZORPAY", idempotencyKey });
      if (!concurrentOrderRecord) throw error;
      if (concurrentOrderRecord.paymentStatus === "paid") {
        return res.status(409).json({ message: "Payment attempt is already completed" });
      }
      if (concurrentOrderRecord.paymentStatus === "failed") {
        return res.status(409).json({ message: "Payment attempt has failed. Start a new checkout attempt." });
      }
      const concurrentOrder = concurrentOrderRecord.razorpayOrderId
        ? concurrentOrderRecord
        : await waitForRazorpayOrder(concurrentOrderRecord._id, req.user._id);
      if (concurrentOrder?.razorpayOrderId) return res.status(200).json(getPaymentOrderResponse(concurrentOrder));
      const expiredOrder = await expireStalePaymentAttempt(concurrentOrder || concurrentOrderRecord, req.user._id);
      if (expiredOrder?.paymentStatus === "failed") {
        return res.status(409).json({ code: "PAYMENT_ATTEMPT_EXPIRED", message: "Payment attempt expired. Start a new checkout attempt." });
      }
      return res.status(409).json({ message: "Payment attempt is still being created. Retry with the same Idempotency-Key." });
    }

    try {
      const razorpayOrder = await razorpay.orders.create({ amount: Math.round(totalPrice * 100), currency: "INR", receipt: localOrder._id.toString() });
      localOrder.razorpayOrderId = razorpayOrder.id;
      await localOrder.save();
      res.status(201).json(getPaymentOrderResponse(localOrder));
    } catch (error) {
      localOrder.paymentStatus = "failed";
      await localOrder.save();
      throw error;
    }
  } catch (error) { handleError(res, error, "Unable to create payment order"); }
};

export const verifyPayment = async (req, res) => {
  try {
    const { localOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findOne({ _id: localOrderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === "paid") {
      if (order.razorpayPaymentId === razorpay_payment_id) return res.json({ success: true, alreadyProcessed: true, order });
      return res.status(409).json({ message: "Order has already been paid" });
    }
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) return res.status(400).json({ message: "Razorpay order mismatch" });
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (!razorpay_signature || expectedSignature.length !== razorpay_signature.length || !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))) return res.status(400).json({ message: "Invalid payment signature" });
    const updatedOrder = await runTransaction(async (session) => {
      const paymentOrder = await Order.findOneAndUpdate(
        { _id: order._id, user: req.user._id, isPaid: false, paymentStatus: { $ne: "paid" }, inventoryDeducted: false },
        { $set: { inventoryDeducted: true } },
        { new: true, session },
      );
      if (!paymentOrder) return null;
      for (const item of paymentOrder.orderItems) {
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
      return Order.findOneAndUpdate(
        { _id: paymentOrder._id, isPaid: false, paymentStatus: { $ne: "paid" } },
        { $set: { isPaid: true, paymentStatus: "paid", paidAt: new Date(), razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, lastPaymentEvent: "payment.captured" }, $push: { paymentEvents: { event: "payment.captured", status: "paid" } } },
        { new: true, session },
      );
    });
    if (!updatedOrder) return res.json({ success: true, alreadyProcessed: true, order });
    await sendPaymentConfirmation(updatedOrder, req.user);
    res.json({ success: true, order: updatedOrder });
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

        const update = { $set: { lastPaymentEvent: event }, $push: { paymentEvents: { eventId, event, status: payment.status } } };
        if ((event === "payment.captured" || event === "order.paid") && !order.isPaid) Object.assign(update.$set, { isPaid: true, paymentStatus: "paid", paidAt: new Date(), razorpayPaymentId: payment.id });
        if (event === "payment.failed" && !order.isPaid) update.$set.paymentStatus = "failed";
        const processedOrder = await Order.findByIdAndUpdate(order._id, update, { new: true, session }).populate("user");
        await WebhookEvent.updateOne({ eventId }, { $set: { status: "processed", processedAt: new Date() } }, { session });
        return { order: processedOrder, wasUnpaid: !order.isPaid };
      });
    } catch (error) {
      if (error.code === 11000) return res.json({ received: true, alreadyProcessed: true });
      throw error;
    }

    if (updatedOrder?.order?.isPaid && updatedOrder.wasUnpaid) await sendPaymentConfirmation(updatedOrder.order, updatedOrder.order.user);
    res.json({ received: true });
  } catch (error) { console.error("Razorpay webhook error:", error); res.status(400).json({ message: "Webhook processing failed" }); }
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
