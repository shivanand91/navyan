import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subscriptionId: { type: String, required: true, unique: true, index: true },
    provider: { type: String, default: "onesignal" },
    browser: String,
    platform: String,
    permissionStatus: { type: String, default: "granted" },
    isActive: { type: Boolean, default: true, index: true },
    lastSeenAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const PushSubscription = mongoose.model("PushSubscription", pushSubscriptionSchema);
