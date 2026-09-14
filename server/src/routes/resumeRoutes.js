import express from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/authMiddleware.js";
import { uploadResume } from "../middleware/uploadMiddleware.js";
import { analyzeResumeController } from "../controllers/resumeController.js";

const router = express.Router();
const limiter = rateLimit({ windowMs: 60 * 60 * 1000, max: Number(process.env.RESUME_ANALYSIS_RATE_LIMIT || 6), standardHeaders: true, legacyHeaders: false, message: { message: "You have reached the resume analysis limit. Please try again later." } });
router.post("/analyze", protect, limiter, uploadResume.single("resume"), analyzeResumeController);
export default router;
