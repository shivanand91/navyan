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

    if (updates.dailyHours !== undefined) {
      if (updates.dailyHours === "" || updates.dailyHours === null) {
        delete updates.dailyHours;
      } else {
        const num = Number(updates.dailyHours);
        if (!Number.isNaN(num)) {
          updates.dailyHours = num;
        } else {
          delete updates.dailyHours;
        }
      }
    }

    if (updates.hasLaptop !== undefined) {
      updates.hasLaptop = parseBoolean(updates.hasLaptop);
    }

    if (updates.allowJobEmails !== undefined) {
      updates.allowJobEmails = parseBoolean(updates.allowJobEmails);
    }

    const fullName =
      typeof updates.fullName === "string" && updates.fullName.trim()
        ? updates.fullName.trim()
        : user.fullName || user.profile?.fullName || "Student";

    const email =
      typeof updates.email === "string" && updates.email.trim()
        ? updates.email.trim().toLowerCase()
        : user.email || user.profile?.email || "";

    user.fullName = fullName;
    user.email = email;

    user.profile = {
      ...(user.profile?.toObject?.() || {}),
      ...updates,
      fullName,
      email,
      isCompleted: true
    };

    await user.save();

    res.json({ profile: user.profile, completion: getProfileCompletion(user.profile) });
  } catch (err) {
    next(err);
  }
};
