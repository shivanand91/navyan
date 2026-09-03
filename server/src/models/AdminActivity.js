import mongoose from "mongoose";

const adminActivitySchema = new mongoose.Schema(
  {
    eventType: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    priority: { type: String, enum: ["LOW", "NORMAL", "HIGH", "CRITICAL"], default: "NORMAL", index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    sessionId: { type: String, index: true },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: "Internship", index: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    isNotification: { type: Boolean, default: false, index: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    dedupeKey: { type: String, index: true },
    expiresAt: Date
  },
  { timestamps: true, minimize: false }
);

adminActivitySchema.index({ isNotification: 1, isRead: 1, createdAt: -1 });
adminActivitySchema.index({ createdAt: -1, eventType: 1 });
adminActivitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AdminActivity = mongoose.model("AdminActivity", adminActivitySchema);
