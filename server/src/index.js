import "./config/env.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";

import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import internshipRoutes from "./routes/internshipRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import serviceInquiryRoutes from "./routes/serviceInquiryRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { normalizeAbsoluteUrl } from "./utils/origin.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

const normalizeOrigin = (value) => normalizeAbsoluteUrl(value);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createOriginMatcher = (value) => {
  const normalized = normalizeOrigin(value);
  if (!normalized) return null;

  if (normalized.includes("*")) {
    const pattern = normalized.split("*").map(escapeRegex).join(".*");
    const regex = new RegExp(`^${pattern}$`);
    return (origin) => regex.test(origin);
  }

  return (origin) => origin === normalized;
};

const allowedOrigins = [
  ...(process.env.ALLOWED_ORIGINS || "").split(","),
  process.env.CLIENT_URL || "https://www.navyan.online",
  "https://www.navyan.online",
  "https://navyan.online",
  "https://navyan.vercel.app"
]
  .map(normalizeOrigin)
  .filter(Boolean);

const originMatchers = [...new Set(allowedOrigins)].map(createOriginMatcher).filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const isAllowed =
      originMatchers.length === 0 ||
      originMatchers.some((matcher) => matcher(normalizedOrigin));

    if (isAllowed) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

const trustProxySetting = (() => {
  const configured = process.env.TRUST_PROXY;

  if (configured === undefined || configured === "") {
    return isProduction ? 1 : false;
  }

  if (configured === "true") return 1;
  if (configured === "false") return false;

  const numeric = Number(configured);
  return Number.isNaN(numeric) ? configured : numeric;
})();

app.set("trust proxy", trustProxySetting);

// Security & core middleware
app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api", apiLimiter);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "navyan-api woking..." });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/service-inquiries", serviceInquiryRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 + errors
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || (isProduction ? "0.0.0.0" : "127.0.0.1");

connectDB()
  .then(async () => {
    app.listen(PORT, HOST, () => {
      console.log(`Navyan API running on http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect DB", err);
    process.exit(1);
  });
