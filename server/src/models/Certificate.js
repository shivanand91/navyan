import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true
    },
    fullName: { type: String, required: true },
    role: String,
    durationKey: {
      type: String,
      required: true
    },
    completionDate: { type: Date, required: true },
    issueDate: { type: Date, default: Date.now },
    certificateId: { type: String, required: true, unique: true, index: true },
    pdfUrl: { type: String, required: true },
    verifyUrl: String,
    verificationStatus: {
      type: String,
      enum: ["Valid", "Revoked"],
      default: "Valid"
    },
    revokedAt: Date
  },
  { timestamps: true }
);

export const Certificate = mongoose.model("Certificate", certificateSchema);
