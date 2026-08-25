import mongoose from "mongoose";

const durationOptionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true
    },
    label: String,
    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    benefits: [String],
    rewards: [String],
    description: String,
    mentorship: String,
    schedule: String,
    projects: [String],
    tasks: [String],
    certificate: String,
    swag: String,
    eligibility: String,
    faqs: [
      {
        question: String,
        answer: String
      }
    ],
    taskPdfUrl: String
  },
  { _id: false }
);

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    archivedSlug: String,
    coverImageUrl: String,
    shortDescription: { type: String, required: true },
    description: String,
    role: String,
    mode: {
      type: String,
      enum: ["remote", "hybrid", "onsite"],
      default: "remote"
    },
    skillsRequired: [String],
    openings: Number,
    lastDateToApply: Date,
    isPublished: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    durations: [durationOptionSchema]
  },
  { timestamps: true }
);

export const Internship = mongoose.model("Internship", internshipSchema);
