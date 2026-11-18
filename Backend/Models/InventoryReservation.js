import mongoose from "mongoose";
import { randomUUID } from "crypto";
import { getReservationExpiry } from "../Config/inventoryReservation.js";

export const RESERVATION_STATUSES = Object.freeze({
  ACTIVE: "active",
  CONFIRMED: "confirmed",
  RELEASED: "released",
});

const reservationItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    qty: { type: Number, required: true, min: 1, validate: Number.isInteger },
  },
  { _id: false },
);

const inventoryReservationSchema = new mongoose.Schema(
  {
    reservationId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      default: randomUUID,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      immutable: true,
    },
    razorpayOrderId: { type: String, trim: true, sparse: true, unique: true },
    items: {
      type: [reservationItemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "A reservation must contain at least one product",
      },
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(RESERVATION_STATUSES),
      default: RESERVATION_STATUSES.ACTIVE,
    },
    expiresAt: { type: Date, required: true, default: () => getReservationExpiry() },
    confirmedAt: Date,
    releasedAt: Date,
    releaseReason: {
      type: String,
      enum: ["payment_failed", "expired", "razorpay_order_creation_failed"],
    },
    idempotencyKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      immutable: true,
    },
  },
  { timestamps: true },
);

inventoryReservationSchema.index({ customer: 1, idempotencyKey: 1 }, { unique: true });
inventoryReservationSchema.index({ status: 1, expiresAt: 1 });

inventoryReservationSchema.pre("validate", function validateLifecycle() {
  if (this.isNew && this.status !== RESERVATION_STATUSES.ACTIVE) {
    this.invalidate("status", "Reservations must be created active");
  }
  if (this.isNew && (this.confirmedAt || this.releasedAt || this.releaseReason)) {
    this.invalidate("status", "Active reservations cannot have confirmation or release metadata");
  }
  if (this.isModified("status") && !this.isNew) {
    this.invalidate("status", "Use transitionStatus() to change reservation state");
  }
});

const guardStateUpdates = function guardStateUpdates() {
  const update = this.getUpdate() || {};
  if (Array.isArray(update) || Object.hasOwn(update.$unset || {}, "status") || Object.hasOwn(update.$rename || {}, "status")) {
    throw new Error("Reservation lifecycle fields cannot be changed through update pipelines or removal");
  }
  const targetStatus = update.status ?? update.$set?.status;
  if (targetStatus !== undefined) {
    const filter = this.getFilter();
    const activeFilter = filter.status === RESERVATION_STATUSES.ACTIVE ||
      filter.status?.$eq === RESERVATION_STATUSES.ACTIVE;
    const timestampField = targetStatus === RESERVATION_STATUSES.CONFIRMED ? "confirmedAt" : "releasedAt";
    if (!activeFilter || ![RESERVATION_STATUSES.CONFIRMED, RESERVATION_STATUSES.RELEASED].includes(targetStatus) ||
      (update.$set?.[timestampField] === undefined && update[timestampField] === undefined) ||
      (targetStatus === RESERVATION_STATUSES.RELEASED && update.$set?.releaseReason === undefined && update.releaseReason === undefined)) {
      throw new Error("Reservation status can only transition atomically from active to confirmed or released");
    }
  }
};

inventoryReservationSchema.pre(
  ["findOneAndUpdate", "findByIdAndUpdate", "updateOne", "updateMany"],
  guardStateUpdates,
);

inventoryReservationSchema.statics.transitionStatus = async function transitionStatus(
  reservationId,
  targetStatus,
  { now = new Date(), releaseReason } = {},
) {
  if (![RESERVATION_STATUSES.CONFIRMED, RESERVATION_STATUSES.RELEASED].includes(targetStatus)) {
    throw new Error(`Invalid reservation transition target: ${targetStatus}`);
  }

  const timestampField = targetStatus === RESERVATION_STATUSES.CONFIRMED ? "confirmedAt" : "releasedAt";
  if (targetStatus === RESERVATION_STATUSES.RELEASED && !releaseReason) {
    throw new Error("A release reason is required when releasing a reservation");
  }
  const update = { $set: { status: targetStatus, [timestampField]: now } };
  if (releaseReason) update.$set.releaseReason = releaseReason;
  return this.findOneAndUpdate(
    { reservationId, status: RESERVATION_STATUSES.ACTIVE },
    update,
    { new: true, runValidators: true },
  );
};

export default mongoose.model("InventoryReservation", inventoryReservationSchema);
