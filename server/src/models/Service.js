import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    featureImageUrl: { type: String, trim: true },
    highlights: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date
  },
  { timestamps: true }
);

export const Service = mongoose.model("Service", serviceSchema);
