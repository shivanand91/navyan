import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    description: { type: String, required: true, trim: true },
    coverImageUrl: { type: String, trim: true, default: "" },
    minTeamSize: { type: Number, required: true, default: 1, min: 1, max: 4 },
    maxTeamSize: { type: Number, required: true, default: 4, min: 1, max: 4 },
    registrationLink: { type: String, trim: true, default: "" },
    isPublished: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Hackathon = mongoose.model("Hackathon", hackathonSchema);
