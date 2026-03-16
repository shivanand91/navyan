import jwt from "jsonwebtoken";
import crypto from "crypto";

export const signAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
};

export const signRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      type: "refresh"
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
