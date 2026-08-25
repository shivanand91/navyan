import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    type: {
      type: String,
      enum: ["General", "Internship", "Application", "Project", "Deadline", "Announcement", "Important"],
      default: "General",
      index: true
    },
    audience: { type: String, default: "All Registered Users" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Draft", "Queued", "Sending", "Sent", "Failed"],
      default: "Draft",
      index: true
    },
    totalRecipients: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    sentAt: Date
  },
  { timestamps: true }
);

export const Broadcast = mongoose.model("Broadcast", broadcastSchema);
