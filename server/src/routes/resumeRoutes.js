import express from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/authMiddleware.js";
import { uploadResume } from "../middleware/uploadMiddleware.js";
import { analyzeResumeController, recommendResumeController } from "../controllers/resumeController.js";

const router = express.Router();
const limiter = rateLimit({ windowMs: 60 * 60 * 1000, max: Number(process.env.RESUME_ANALYSIS_RATE_LIMIT || 6), standardHeaders: true, legacyHeaders: false, message: { message: "You have reached the resume analysis limit. Please try again later." } });
const parseRecommendationUpload = (req, res, next) => uploadResume.single("resume")(req, res, (error) => {
  if (!error) return next();
  if (error.code === "LIMIT_FILE_SIZE") return res.status(413).json({ success: false, message: "Your resume must be 5 MB or smaller." });
  return res.status(error.statusCode || 400).json({ success: false, message: error.message || "Please upload a valid PDF or DOCX resume." });
});
router.post("/recommendations", limiter, parseRecommendationUpload, recommendResumeController);
router.post("/analyze", protect, limiter, uploadResume.single("resume"), analyzeResumeController);
router.use((error, req, res, next) => {
  if (req.path === "/recommendations") return res.status(500).json({ success: false, message: "We couldn't process this resume right now. Please try again shortly." });
  return next(error);
});
export default router;
