import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    whatsapp: String,
    city: String,
    state: String,
    college: String,
    degree: String,
    branch: String,
    currentYear: String,
    graduationYear: String,
    skills: [String],
    preferredRoles: [String],
    prevInternshipExperience: String,
    dailyHours: Number,
    hasLaptop: Boolean,
    englishLevel: String,
    resumeUrl: String,
    portfolioUrl: String,
    githubUrl: String,
    linkedinUrl: String,
    avatarUrl: String,
    allowJobEmails: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    refreshTokenHash: String,
    profile: profileSchema
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
