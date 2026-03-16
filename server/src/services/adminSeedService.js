import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

export const upsertAdminAccount = async ({
  email = process.env.SEED_ADMIN_EMAIL || "admin@navyan.dev",
  password = process.env.SEED_ADMIN_PASSWORD || "Admin@123456",
  fullName = process.env.SEED_ADMIN_NAME || "Navyan Admin"
} = {}) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    throw new Error("Admin email and password are required");
  }

  const existing = await User.findOne({ email: normalizedEmail });
  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    existing.role = "admin";
    existing.fullName = fullName;
    existing.passwordHash = passwordHash;
    existing.profile = {
      ...(existing.profile?.toObject?.() || {}),
      fullName,
      email: normalizedEmail,
      isCompleted: true
    };
    await existing.save();
    return { user: existing, created: false };
  }

  const user = await User.create({
    role: "admin",
    fullName,
    email: normalizedEmail,
    passwordHash,
    profile: {
      fullName,
      email: normalizedEmail,
      isCompleted: true
    }
  });

  return { user, created: true };
};
