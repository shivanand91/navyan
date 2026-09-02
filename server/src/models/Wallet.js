import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    availableBalance: { type: Number, default: 0, min: 0 },
    pendingBalance: { type: Number, default: 0, min: 0 },
    totalEarned: { type: Number, default: 0, min: 0 },
    totalWithdrawn: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export const Wallet = mongoose.model("Wallet", walletSchema);
