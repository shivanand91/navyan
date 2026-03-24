import mongoose from "mongoose";

const projectItemSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    codeLink: { type: String, required: true },
    liveDemoLink: String
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true
    },
    attemptNumber: { type: Number, default: 1 },
    studentName: { type: String, required: true },
    taskName: { type: String, required: true },
    taskNumber: { type: String, required: true },
    projectTitle: { type: String, required: true },
    codeLink: { type: String, required: true },
    liveDemoLink: String,
    projects: [projectItemSchema],
    driveLink: String,
    notes: String,
    submittedAt: { type: Date, default: Date.now },
    reviewStatus: {
      type: String,
      enum: ["Submitted", "Revision Requested", "Completed", "Rejected"],
      default: "Submitted"
    },
    revisionRequested: { type: Boolean, default: false },
    adminNotes: String
  },
  { timestamps: true }
);

submissionSchema.index({ application: 1, attemptNumber: 1 }, { unique: true });

export const Submission = mongoose.model("Submission", submissionSchema);
