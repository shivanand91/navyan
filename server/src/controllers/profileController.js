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

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("profile fullName email role");
    const completion = getProfileCompletion(user.profile);
    res.json({
      profile: user.profile,
      basic: { fullName: user.fullName, email: user.email, role: user.role },
      completion
    });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (updates.skills !== undefined) {
      updates.skills = splitCsv(updates.skills);
    }

    if (updates.preferredRoles !== undefined) {
      updates.preferredRoles = splitCsv(updates.preferredRoles);
    }

    if (updates.dailyHours !== undefined && updates.dailyHours !== "") {
      updates.dailyHours = Number(updates.dailyHours);
    }

    if (updates.hasLaptop !== undefined) {
      updates.hasLaptop = parseBoolean(updates.hasLaptop);
    }

    if (typeof updates.fullName === "string" && updates.fullName.trim()) {
      user.fullName = updates.fullName.trim();
    }

    if (typeof updates.email === "string" && updates.email.trim()) {
      user.email = updates.email.trim().toLowerCase();
      updates.email = user.email;
    }

    user.profile = {
      ...user.profile?.toObject?.(),
      ...updates,
      isCompleted: true
    };

    await user.save();

    res.json({ profile: user.profile, completion: getProfileCompletion(user.profile) });
  } catch (err) {
    next(err);
  }
};
