import mongoose from "mongoose";

const applicantSnapshotSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    phone: String,
    city: String,
    state: String,
    college: String,
    degree: String,
    branch: String,
    resumeUrl: String,
    portfolioUrl: String,
    githubUrl: String,
    linkedinUrl: String
  },
  { _id: false }
);

const jobApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    applicantSnapshot: { type: applicantSnapshotSchema, default: {} },
    status: {
      type: String,
      enum: ["Received", "Contacted", "Closed"],
      default: "Received",
      index: true
    },
    adminNotes: { type: String, default: "" }
  },
  { timestamps: true }
);

jobApplicationSchema.index({ job: 1, user: 1 }, { unique: true });

export const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
