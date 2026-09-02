import mongoose from "mongoose";

const shareAttributionSchema = new mongoose.Schema(
  {
    shareLink: { type: mongoose.Schema.Types.ObjectId, ref: "ShareLink", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referredUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: "Internship", required: true },
    firstClickedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    status: { type: String, enum: ["ATTRIBUTED", "CONVERTED", "EXPIRED", "BLOCKED"], default: "ATTRIBUTED" }
  },
  { timestamps: true }
);

shareAttributionSchema.index({ referredUser: 1, internship: 1 }, { unique: true });

export const ShareAttribution = mongoose.model("ShareAttribution", shareAttributionSchema);
