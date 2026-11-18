import mongoose from "mongoose";
import InventoryReservation, {
  RESERVATION_STATUSES,
} from "../Models/InventoryReservation.js";
import Order from "../Models/Order.js";
import Product from "../Models/Product.js";
import { getReservationExpiry } from "../Config/inventoryReservation.js";

export const RESERVATION_RELEASE_REASONS = Object.freeze({
  PAYMENT_FAILED: "payment_failed",
  EXPIRED: "expired",
  RAZORPAY_ORDER_CREATION_FAILED: "razorpay_order_creation_failed",
});

export class ReservationError extends Error {
  constructor(message, code, status = 409) {
    super(message);
    this.name = "ReservationError";
    this.code = code;
    this.status = status;
  }
}

const sameObjectId = (left, right) => String(left) === String(right);

const sameItems = (left, right) => left.length === right.length && left.every(
  (item, index) => sameObjectId(item.product, right[index].product) && item.qty === right[index].qty,
);

export const normalizeReservationItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ReservationError("No items were supplied for reservation", "INVALID_RESERVATION_ITEMS", 400);
  }

  const quantities = new Map();
  for (const item of items) {
    const product = item?.product ?? item?.productId;
    const qty = item?.qty;
    if (!mongoose.isValidObjectId(product) || !Number.isInteger(qty) || qty < 1) {
      throw new ReservationError("Invalid product or quantity", "INVALID_RESERVATION_ITEMS", 400);
    }
    const productId = String(product);
    quantities.set(productId, (quantities.get(productId) || 0) + qty);
  }

  return [...quantities.entries()]
    .map(([product, qty]) => ({ product: new mongoose.Types.ObjectId(product), qty }))
    .sort((left, right) => String(left.product).localeCompare(String(right.product)));
};

const requireObjectId = (value, field) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new ReservationError(`Invalid ${field}`, "INVALID_RESERVATION_REQUEST", 400);
  }
  return new mongoose.Types.ObjectId(value);
};

const requireIdempotencyKey = (idempotencyKey) => {
  if (typeof idempotencyKey !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(idempotencyKey)) {
    throw new ReservationError("A valid idempotency key is required", "INVALID_IDEMPOTENCY_KEY", 400);
  }
  return idempotencyKey;
};

const assertExistingRazorpayOrder = async (customerId, orderId, session) => {
  const order = await Order.findOne({
    _id: orderId,
    user: customerId,
    paymentMethod: "RAZORPAY",
  }).session(session);
  if (!order) {
    throw new ReservationError("Razorpay order was not found for this customer", "ORDER_NOT_FOUND", 404);
  }
  return order;
};

const assertSameReservationRequest = (reservation, orderId, items) => {
  if (!sameObjectId(reservation.order, orderId) || !sameItems(reservation.items, items)) {
    throw new ReservationError(
      "This idempotency key was already used for a different checkout request",
      "IDEMPOTENCY_KEY_REUSED",
    );
  }
};

const getReservationAfterLostRace = async (customerId, idempotencyKey, orderId, items) => {
  const reservation = await InventoryReservation.findOne({ customer: customerId, idempotencyKey });
  if (!reservation) return null;
  assertSameReservationRequest(reservation, orderId, items);
  return reservation;
};

export const runReservationTransaction = async (operation, existingSession) => {
  if (existingSession) return operation(existingSession);
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

export const reserveInventory = async ({ customer, order, items, idempotencyKey, razorpayOrderId, session }) => {
  const customerId = requireObjectId(customer, "customer");
  const orderId = requireObjectId(order?._id ?? order, "order");
  const normalizedItems = normalizeReservationItems(items);
  const validIdempotencyKey = requireIdempotencyKey(idempotencyKey);

  try {
    return await runReservationTransaction(async (transactionSession) => {
      const existing = await InventoryReservation.findOne({
        customer: customerId,
        idempotencyKey: validIdempotencyKey,
      }).session(transactionSession);
      if (existing) {
        assertSameReservationRequest(existing, orderId, normalizedItems);
        return { reservation: existing, created: false };
      }

      await assertExistingRazorpayOrder(customerId, orderId, transactionSession);

      for (const item of normalizedItems) {
        const product = await Product.findOneAndUpdate(
          { _id: item.product, countInStock: { $gte: item.qty } },
          { $inc: { countInStock: -item.qty } },
          { new: true, session: transactionSession },
        );
        if (!product) {
          throw new ReservationError(
            "This item is currently unavailable. Please try again shortly.",
            "INSUFFICIENT_STOCK",
          );
        }
      }

      const [reservation] = await InventoryReservation.create([{
        customer: customerId,
        order: orderId,
        razorpayOrderId,
        items: normalizedItems,
        idempotencyKey: validIdempotencyKey,
        expiresAt: getReservationExpiry(),
      }], { session: transactionSession });
      await Order.updateOne(
        { _id: orderId, paymentMethod: "RAZORPAY" },
        { $set: { inventoryDeducted: true } },
        { session: transactionSession },
      );
      return { reservation, created: true };
    }, session);
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const reservation = await getReservationAfterLostRace(customerId, validIdempotencyKey, orderId, normalizedItems);
    if (reservation) return { reservation, created: false };
    throw error;
  }
};

const assertReservationIdentity = (reservation, { order, razorpayOrderId } = {}) => {
  if (order && !sameObjectId(reservation.order, order)) {
    throw new ReservationError("Reservation does not belong to this order", "RESERVATION_ORDER_MISMATCH");
  }
  if (razorpayOrderId && reservation.razorpayOrderId && reservation.razorpayOrderId !== razorpayOrderId) {
    throw new ReservationError("Reservation does not match this Razorpay order", "RESERVATION_PAYMENT_MISMATCH");
  }
};

export const confirmReservation = async ({ reservationId, order, razorpayOrderId, now = new Date(), session }) => {
  if (typeof reservationId !== "string" || !reservationId) {
    throw new ReservationError("A reservation ID is required", "INVALID_RESERVATION_REQUEST", 400);
  }

  return runReservationTransaction(async (transactionSession) => {
    const filter = {
      reservationId,
      status: RESERVATION_STATUSES.ACTIVE,
      expiresAt: { $gt: now },
    };
    if (order) filter.order = requireObjectId(order?._id ?? order, "order");
    if (razorpayOrderId) {
      filter.$or = [{ razorpayOrderId }, { razorpayOrderId: { $exists: false } }];
    }

    const update = { $set: { status: RESERVATION_STATUSES.CONFIRMED, confirmedAt: now } };
    if (razorpayOrderId) update.$set.razorpayOrderId = razorpayOrderId;
    const confirmed = await InventoryReservation.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
      session: transactionSession,
    });
    if (confirmed) return { reservation: confirmed, confirmed: true };

    const reservation = await InventoryReservation.findOne({ reservationId }).session(transactionSession);
    if (!reservation) throw new ReservationError("Reservation not found", "RESERVATION_NOT_FOUND", 404);
    assertReservationIdentity(reservation, { order, razorpayOrderId });
    if (reservation.status === RESERVATION_STATUSES.CONFIRMED) return { reservation, confirmed: false };
    if (reservation.status === RESERVATION_STATUSES.RELEASED) {
      throw new ReservationError("Reservation has already been released", "RESERVATION_RELEASED");
    }
    throw new ReservationError("Reservation has expired", "RESERVATION_EXPIRED");
  }, session);
};

export const releaseReservation = async ({ reservationId, reason, now = new Date(), session }) => {
  if (typeof reservationId !== "string" || !reservationId) {
    throw new ReservationError("A reservation ID is required", "INVALID_RESERVATION_REQUEST", 400);
  }
  if (!Object.values(RESERVATION_RELEASE_REASONS).includes(reason)) {
    throw new ReservationError("A valid release reason is required", "INVALID_RELEASE_REASON", 400);
  }

  return runReservationTransaction(async (transactionSession) => {
    const filter = { reservationId, status: RESERVATION_STATUSES.ACTIVE };
    if (reason === RESERVATION_RELEASE_REASONS.EXPIRED) filter.expiresAt = { $lte: now };
    const released = await InventoryReservation.findOneAndUpdate(
      filter,
      { $set: { status: RESERVATION_STATUSES.RELEASED, releasedAt: now, releaseReason: reason } },
      { new: true, runValidators: true, session: transactionSession },
    );

    if (released) {
      for (const item of released.items) {
        const result = await Product.updateOne(
          { _id: item.product },
          { $inc: { countInStock: item.qty } },
          { session: transactionSession },
        );
        if (result.matchedCount !== 1) {
          throw new ReservationError("Reserved product was not found", "RESERVED_PRODUCT_NOT_FOUND", 409);
        }
      }
      await Order.updateOne(
        { _id: released.order, paymentMethod: "RAZORPAY" },
        { $set: { inventoryDeducted: false } },
        { session: transactionSession },
      );
      return { reservation: released, released: true };
    }

    const reservation = await InventoryReservation.findOne({ reservationId }).session(transactionSession);
    if (!reservation) throw new ReservationError("Reservation not found", "RESERVATION_NOT_FOUND", 404);
    if (reservation.status === RESERVATION_STATUSES.RELEASED) return { reservation, released: false };
    if (reservation.status === RESERVATION_STATUSES.CONFIRMED) {
      throw new ReservationError("Confirmed reservations cannot be released", "RESERVATION_CONFIRMED");
    }
    throw new ReservationError("Reservation has not expired", "RESERVATION_NOT_EXPIRED");
  }, session);
};

export const attachRazorpayOrderToReservation = async ({ reservationId, order, razorpayOrderId, session }) => {
  if (typeof reservationId !== "string" || !reservationId || typeof razorpayOrderId !== "string" || !razorpayOrderId) {
    throw new ReservationError("Reservation and Razorpay order IDs are required", "INVALID_RESERVATION_REQUEST", 400);
  }
  const orderId = requireObjectId(order?._id ?? order, "order");
  return runReservationTransaction(async (transactionSession) => {
    const reservation = await InventoryReservation.findOneAndUpdate(
      {
        reservationId,
        order: orderId,
        status: RESERVATION_STATUSES.ACTIVE,
        $or: [{ razorpayOrderId }, { razorpayOrderId: { $exists: false } }],
      },
      { $set: { razorpayOrderId } },
      { new: true, runValidators: true, session: transactionSession },
    );
    if (reservation) return reservation;
    const existing = await InventoryReservation.findOne({ reservationId }).session(transactionSession);
    if (!existing) throw new ReservationError("Reservation not found", "RESERVATION_NOT_FOUND", 404);
    assertReservationIdentity(existing, { order: orderId, razorpayOrderId });
    throw new ReservationError("Reservation is no longer active", "RESERVATION_NOT_ACTIVE");
  }, session);
};
