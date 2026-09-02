import mongoose from "mongoose";

const shareLinkSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: "Internship", required: true, index: true },
    durationKey: { type: String, required: true },
    token: { type: String, required: true, unique: true, index: true },
    creatorIpHash: String,
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

shareLinkSchema.index({ owner: 1, internship: 1, durationKey: 1 }, { unique: true });

export const ShareLink = mongoose.model("ShareLink", shareLinkSchema);
