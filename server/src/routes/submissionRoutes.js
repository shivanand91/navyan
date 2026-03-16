import express from "express";
import {
  adminListSubmissions,
  adminReviewSubmission,
  listMySubmissionHistory,
  submitProject
} from "../controllers/submissionController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/application/:applicationId", protect, listMySubmissionHistory);
router.post("/:applicationId", protect, submitProject);

router.get("/admin", protect, requireAdmin, adminListSubmissions);
router.patch("/admin/:id", protect, requireAdmin, adminReviewSubmission);

export default router;
