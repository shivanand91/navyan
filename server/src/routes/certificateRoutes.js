import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { Certificate } from "../models/Certificate.js";

const router = express.Router();

// Phase 2 compatibility: allow student UI to load (returns empty until Phase 4 issues certs)
router.get("/me", protect, async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ certificates });
  } catch (err) {
    next(err);
  }
});

router.get("/admin", protect, requireAdmin, async (req, res, next) => {
  try {
    const certificates = await Certificate.find()
      .populate("user")
      .populate("internship")
      .sort({ createdAt: -1 });
    res.json({ certificates });
  } catch (err) {
    next(err);
  }
});

// Public verification (Phase 4 will enrich output; Phase 2 keeps contract stable)
router.get("/verify/:certificateId", async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const certificate = await Certificate.findOne({ certificateId }).select(
      "fullName role durationKey completionDate issueDate certificateId verifyUrl pdfUrl verificationStatus"
    );
    if (!certificate) return res.status(404).json({ valid: false });
    res.json({ valid: certificate.verificationStatus !== "Revoked", certificate });
  } catch (err) {
    next(err);
  }
});

export default router;
