import mongoose from "mongoose";

const MAX_QTY = 10;

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  size: {
    type: String,
    required: false,
    default: "",
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
    max: MAX_QTY,
    default: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Fast lookups by user (the unique index covers single-user fetch)
cartSchema.index({ user: 1 });

export { MAX_QTY };
export default mongoose.model("Cart", cartSchema);
