import mongoose from "mongoose";

const shareVisitSchema = new mongoose.Schema(
  {
    visitorToken: { type: String, required: true, index: true },
    ipHash: String,
    shareLink: { type: mongoose.Schema.Types.ObjectId, ref: "ShareLink", required: true },
    clickedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

shareVisitSchema.index({ visitorToken: 1, shareLink: 1 }, { unique: true });

export const ShareVisit = mongoose.model("ShareVisit", shareVisitSchema);
