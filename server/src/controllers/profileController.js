import { User } from "../models/User.js";
import { getProfileCompletion } from "../utils/profileCompletion.js";

const splitCsv = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== "string") return value;

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return value;

  const normalized = value.trim().toLowerCase();
  if (["yes", "true", "1"].includes(normalized)) return true;
  if (["no", "false", "0"].includes(normalized)) return false;
  return value;
};

const sanitizeString = (val) => (typeof val === "string" ? val.trim() : "");

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("profile fullName email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const mergedProfile = {
      fullName: user.fullName || "",
      email: user.email || "",
      ...(user.profile?.toObject?.() || {})
    };

    const completion = getProfileCompletion(mergedProfile);
    res.json({
      profile: mergedProfile,
      basic: { fullName: user.fullName, email: user.email, role: user.role },
      completion
    });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const body = req.body || {};

    const fullName = sanitizeString(body.fullName) || user.fullName || user.profile?.fullName || "Student";
    const email = (sanitizeString(body.email) || user.email || user.profile?.email || "").toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (email !== user.email) {
      const existing = await User.findOne({ email, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ message: "Email is already in use by another account" });
      }
    }

    let dailyHours = undefined;
    if (body.dailyHours !== undefined && body.dailyHours !== "" && body.dailyHours !== null) {
      const num = Number(body.dailyHours);
      if (!Number.isNaN(num) && num >= 0) {
        dailyHours = num;
      }
    }

    const existingProfile = user.profile?.toObject?.() || {};

    const newProfile = {
      ...existingProfile,
      fullName,
      email,
      phone: body.phone !== undefined ? sanitizeString(body.phone) : existingProfile.phone || "",
      whatsapp: body.whatsapp !== undefined ? sanitizeString(body.whatsapp) : existingProfile.whatsapp || "",
      city: body.city !== undefined ? sanitizeString(body.city) : existingProfile.city || "",
      state: body.state !== undefined ? sanitizeString(body.state) : existingProfile.state || "",
      college: body.college !== undefined ? sanitizeString(body.college) : existingProfile.college || "",
      degree: body.degree !== undefined ? sanitizeString(body.degree) : existingProfile.degree || "",
      branch: body.branch !== undefined ? sanitizeString(body.branch) : existingProfile.branch || "",
      currentYear: body.currentYear !== undefined ? sanitizeString(body.currentYear) : existingProfile.currentYear || "",
      graduationYear: body.graduationYear !== undefined ? sanitizeString(body.graduationYear) : existingProfile.graduationYear || "",
      skills: body.skills !== undefined ? splitCsv(body.skills) : existingProfile.skills || [],
      preferredRoles: body.preferredRoles !== undefined ? splitCsv(body.preferredRoles) : existingProfile.preferredRoles || [],
      prevInternshipExperience: body.prevInternshipExperience !== undefined ? sanitizeString(body.prevInternshipExperience) : existingProfile.prevInternshipExperience || "",
      englishLevel: body.englishLevel !== undefined ? sanitizeString(body.englishLevel) : existingProfile.englishLevel || "",
      resumeUrl: body.resumeUrl !== undefined ? sanitizeString(body.resumeUrl) : existingProfile.resumeUrl || "",
      portfolioUrl: body.portfolioUrl !== undefined ? sanitizeString(body.portfolioUrl) : existingProfile.portfolioUrl || "",
      githubUrl: body.githubUrl !== undefined ? sanitizeString(body.githubUrl) : existingProfile.githubUrl || "",
      linkedinUrl: body.linkedinUrl !== undefined ? sanitizeString(body.linkedinUrl) : existingProfile.linkedinUrl || "",
      avatarUrl: body.avatarUrl !== undefined ? sanitizeString(body.avatarUrl) : existingProfile.avatarUrl || "",
      hasLaptop: body.hasLaptop !== undefined ? parseBoolean(body.hasLaptop) : (existingProfile.hasLaptop ?? false),
      allowJobEmails: body.allowJobEmails !== undefined ? parseBoolean(body.allowJobEmails) : (existingProfile.allowJobEmails ?? false),
      isCompleted: true
    };

    if (dailyHours !== undefined) {
      newProfile.dailyHours = dailyHours;
    } else if (body.dailyHours === "" || body.dailyHours === null) {
      delete newProfile.dailyHours;
    }

    user.fullName = fullName;
    user.email = email;
    user.profile = newProfile;

    await user.save();

    res.json({ profile: user.profile, completion: getProfileCompletion(user.profile) });
  } catch (err) {
    next(err);
  }
};
