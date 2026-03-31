import mongoose from "mongoose";

const referralCodeSchema = new mongoose.Schema(
  {
    ownerName: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, index: true, trim: true },
    usageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const ReferralCode = mongoose.model("ReferralCode", referralCodeSchema);
