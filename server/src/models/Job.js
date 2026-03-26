import mongoose from "mongoose";

const SOURCE_TYPES = ["internal", "external"];

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    role: { type: String, trim: true, default: "" },
    field: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    employmentType: { type: String, trim: true, default: "" },
    sourceType: { type: String, enum: SOURCE_TYPES, required: true, default: "internal" },
    applyUrl: { type: String, trim: true, default: "" },
    tags: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
