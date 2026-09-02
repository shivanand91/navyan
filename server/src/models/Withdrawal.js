import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 50 },
    upiId: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "PROCESSING", "COMPLETED", "REJECTED", "FAILED"], default: "PENDING", index: true },
    transactionReference: String,
    adminNote: String,
    processedAt: Date,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
