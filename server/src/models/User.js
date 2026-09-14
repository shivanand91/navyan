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
    technicalSkills: [String],
    programmingLanguages: [String],
    frameworks: [String],
    databases: [String],
    cloud: [String],
    tools: [String],
    softSkills: [String],
    otherSkills: [String],
    preferredRoles: [String],
    careerInterests: [String],
    education: [{ degree: String, field: String, institution: String, graduationYear: String, coursework: [String] }],
    projects: [{ name: String, description: String, technologies: [String], contribution: String, skills: [String] }],
    experience: [{ organization: String, role: String, duration: String, responsibilities: [String], skills: [String] }],
    certifications: [{ name: String, issuer: String, date: String }],
    skillGaps: [String],
    analysisHistory: [{ targetRole: String, overallMatch: Number, analyzedAt: Date, skillGaps: [String], recommendedInternshipIds: [mongoose.Schema.Types.ObjectId] }],
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
    passwordResetTokenHash: String,
    passwordResetExpiresAt: Date,
    profile: profileSchema
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
