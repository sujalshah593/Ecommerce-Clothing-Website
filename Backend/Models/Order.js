import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        name: String,
        qty: Number,
        image: String,
        price: Number,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],

    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },

    paymentMethod: {
      type: String,
      default: "COD",
      enum: ["COD", "RAZORPAY"],
    },

    paymentStatus: {
      type: String,
      enum: ["created", "pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    idempotencyKey: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    paidAt: Date,

    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    razorpaySignature: String,

    paymentEvents: [
      {
        eventId: String,
        event: { type: String, required: true },
        status: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    lastPaymentEvent: String,
    paymentConfirmationSent: { type: Boolean, default: false },

    statusHistory: [
      {
        status: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    inventoryDeducted: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Placed", "Packed", "Shipped", "Out for Delivery", "Delivered"],
      default: "Placed",
    },
  },
  { timestamps: true },
);

orderSchema.index(
  { user: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      paymentMethod: "RAZORPAY",
      idempotencyKey: { $type: "string" },
    },
  },
);

export default mongoose.model("Order", orderSchema);
