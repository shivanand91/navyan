import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../utils/token.js";
import { getAccessCookieOptions, getRefreshCookieOptions } from "../utils/cookies.js";
import { upsertAdminAccount } from "../services/adminSeedService.js";

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const sanitizeUser = (user) => {
  const obj = user.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokenHash;
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
