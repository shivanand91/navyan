import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["CREDIT", "DEBIT"], required: true },
    category: { type: String, enum: ["SHARE_EARN", "WITHDRAWAL", "WITHDRAWAL_RETURN"], required: true },
    amount: { type: Number, required: true, min: 0 },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: "Internship" },
    shareLink: { type: mongoose.Schema.Types.ObjectId, ref: "ShareLink" },
    referredUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    withdrawal: { type: mongoose.Schema.Types.ObjectId, ref: "Withdrawal" },
    status: { type: String, enum: ["PENDING", "AVAILABLE", "REVERSED", "COMPLETED"], default: "AVAILABLE" },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

walletTransactionSchema.index(
  { user: 1, referredUser: 1, internship: 1, category: 1 },
  { unique: true, partialFilterExpression: { category: "SHARE_EARN" } }
);

export const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);
