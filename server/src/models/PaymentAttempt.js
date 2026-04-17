import mongoose from "mongoose";

const paymentAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
      index: true
    },
    durationKey: {
      type: String,
      enum: ["4-weeks", "3-months", "6-months"],
      required: true
    },
    amount: { type: Number, required: true },
    paymentReference: { type: String, required: true, unique: true, index: true },
    utrNumber: String,
    status: {
      type: String,
      enum: [
        "Initiated",
        "Submitted",
        "PendingVerification",
        "Verified",
        "Rejected",
        "Linked",
        "Expired"
      ],
      default: "Initiated",
      index: true
    },
    submittedAt: Date,
    reviewedAt: Date,
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application"
    }
  },
  { timestamps: true }
);

paymentAttemptSchema.index(
  { user: 1, internship: 1, durationKey: 1, status: 1 },
  { partialFilterExpression: { status: { $in: ["Initiated", "Submitted", "PendingVerification"] } } }
);
paymentAttemptSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["Initiated", "Submitted", "PendingVerification"] },
      application: null
    }
  }
);

paymentAttemptSchema.index({ utrNumber: 1 });

export const PaymentAttempt = mongoose.model("PaymentAttempt", paymentAttemptSchema);
