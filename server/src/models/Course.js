import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    category: { type: String, trim: true, default: "" },
    level: { type: String, trim: true, default: "" },
    durationLabel: { type: String, trim: true, default: "" },
    shortDescription: { type: String, trim: true, default: "" },
    youtubeUrl: { type: String, required: true, trim: true },
    videoId: { type: String, required: true, trim: true, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
