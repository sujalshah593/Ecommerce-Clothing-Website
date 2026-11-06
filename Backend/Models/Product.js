import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["Apparel"], 
    },

    targetGroup: {
      type: String,
      required: true,
      enum: ["Men", "Boys"],
    },

    subCategory: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
    },

    sizes: {
      type: [String],
      default: ["S", "M", "L", "XL"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
