import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 200,
    },
    event: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["processed"],
      default: "processed",
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("WebhookEvent", webhookEventSchema);
