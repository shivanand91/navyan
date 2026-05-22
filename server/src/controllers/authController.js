import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/User.js";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../utils/token.js";
import { getAccessCookieOptions, getRefreshCookieOptions } from "../utils/cookies.js";
import { upsertAdminAccount } from "../services/adminSeedService.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import { buildClientUrl } from "../utils/origin.js";

const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_EXPIRY_MINUTES = 30;

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const sanitizeUser = (user) => {
  const obj = user.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokenHash;
  delete obj.passwordResetTokenHash;
  delete obj.passwordResetExpiresAt;
  return obj;
};

const issueAuthTokens = async (user, res) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  res.cookie("navyan_access_token", accessToken, getAccessCookieOptions());
  res.cookie("navyan_refresh_token", refreshToken, getRefreshCookieOptions());

  return accessToken;
};

const createPasswordResetToken = () => crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("hex");

const buildPasswordResetUrl = (req, token) =>
  buildClientUrl(req, `/reset-password/${encodeURIComponent(token)}`);

export const registerStudent = async (req, res, next) => {
  try {
    const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";
    const email = normalizeEmail(req.body.email);
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      passwordHash: hash,
      role: "student",
      profile: {
        fullName,
        email,
        isCompleted: false
      }
    });

    const accessToken = await issueAuthTokens(user, res);
    res.status(201).json({ accessToken, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = await issueAuthTokens(user, res);
    res.json({ accessToken, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    const genericResponse = {
      message: "If an account exists for this email, a password reset link has been sent."
    };

    if (!user) {
      return res.json(genericResponse);
    }

    const resetToken = createPasswordResetToken();
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);
    await user.save();

    const emailSent = await sendPasswordResetEmail({
      user,
      resetUrl: buildPasswordResetUrl(req, resetToken),
      expiresInMinutes: PASSWORD_RESET_EXPIRY_MINUTES
    });

    if (!emailSent) {
      return res.status(500).json({
        message: "Could not send reset email. Please try again later."
      });
    }

    res.json(genericResponse);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const token = typeof req.body.token === "string" ? req.body.token.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!token || !password) {
      return res.status(400).json({ message: "Reset token and new password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      passwordResetTokenHash: hashToken(token),
      passwordResetExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset link is invalid or expired. Please request a new link."
      });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.refreshTokenHash = undefined;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    res.clearCookie("navyan_refresh_token", getRefreshCookieOptions());
    res.clearCookie("navyan_access_token", getAccessCookieOptions());
    res.json({ message: "Password reset successfully. Please log in with your new password." });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    res.json({ user: sanitizeUser(req.user) });
  } catch (err) {
    next(err);
  }
};

export const refreshSession = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.navyan_refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ message: "Session expired" });
    }

    if (user.refreshTokenHash !== hashToken(refreshToken)) {
      return res.status(401).json({ message: "Session expired" });
    }

    const accessToken = await issueAuthTokens(user, res);
    res.json({ accessToken, user: sanitizeUser(user) });
  } catch (err) {
    res.clearCookie("navyan_refresh_token", getRefreshCookieOptions());
    res.clearCookie("navyan_access_token", getAccessCookieOptions());
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.navyan_refresh_token;

    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokenHash = undefined;
        await user.save();
      }
    }
  } catch {
    // Clearing the cookie is sufficient even if token verification fails.
  }

  try {
    res.clearCookie("navyan_refresh_token", getRefreshCookieOptions());
    res.clearCookie("navyan_access_token", getAccessCookieOptions());
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

export const seedAdminDev = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({ message: "Not found" });
    }

    const { user, created } = await upsertAdminAccount();

    res.status(created ? 201 : 200).json({
      message: created ? "Admin created in database" : "Admin updated in database",
      email: user.email
    });
  } catch (err) {
    next(err);
  }
};
