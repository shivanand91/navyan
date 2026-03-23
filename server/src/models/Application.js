import mongoose from "mongoose";

const STATUSES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Selected",
  "In Progress",
  "Submission Pending",
  "Submitted",
  "Revision Requested",
  "Completed",
  "Rejected"
];
const ACTIVE_LOCK_STATUSES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Selected",
  "In Progress",
  "Submission Pending",
  "Submitted",
  "Revision Requested"
];

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true
    },
    durationKey: {
      type: String,
      enum: ["4-weeks", "3-months", "6-months"],
      required: true
    },
    motivation: String,
    status: {
      type: String,
      enum: STATUSES,
      default: "Under Review",
      index: true
    },
    internalNotes: String,
    payment: {
      paymentAttempt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaymentAttempt"
      },
      amount: Number,
      utrNumber: String,
      paymentReference: String,
      status: {
        type: String,
        enum: ["Not Required", "Pending", "Submitted", "Verified", "Rejected", "Linked"],
        default: "Not Required"
      }
    },
    offerLetter: {
      id: String,
      url: String,
      issuedAt: Date
    },
    internshipMeta: {
      startDate: Date,
      endDate: Date,
      taskPdfUrl: String
    },
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission"
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate"
    }
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, internship: 1, durationKey: 1 }, { unique: true });
applicationSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ACTIVE_LOCK_STATUSES }
    }
  }
);

export const Application = mongoose.model("Application", applicationSchema);
