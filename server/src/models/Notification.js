import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    broadcastId: { type: mongoose.Schema.Types.ObjectId, ref: "Broadcast", index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    type: {
      type: String,
      enum: ["General", "Internship", "Application", "Project", "Deadline", "Announcement", "Important"],
      default: "General",
      index: true
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
