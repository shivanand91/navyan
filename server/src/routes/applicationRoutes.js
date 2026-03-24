import express from "express";
import {
  createPaymentIntent,
  applyToInternship,
  listMyApplications,
  adminListApplications,
  adminUpdateApplicationStatus,
  getOfferLetterPdf
} from "../controllers/applicationController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student
router.post("/payment-intent", protect, createPaymentIntent);
router.post("/", protect, applyToInternship);
router.get("/me", protect, listMyApplications);
router.get("/:id/offer-letter", protect, getOfferLetterPdf);

// Admin
router.get("/admin", protect, requireAdmin, adminListApplications);
router.patch("/admin/:id", protect, requireAdmin, adminUpdateApplicationStatus);

export default router;
