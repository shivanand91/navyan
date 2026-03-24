import express from "express";
import {
  createPaymentIntent,
  applyToInternship,
  listMyApplications,
  adminListApplications,
  adminUpdateApplicationStatus,
  getOfferLetterPdf,
  getPublicOfferLetterPdf
} from "../controllers/applicationController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student
router.post("/payment-intent", protect, createPaymentIntent);
router.post("/", protect, applyToInternship);
router.get("/me", protect, listMyApplications);
router.get("/offer-letter/:accessToken", getPublicOfferLetterPdf);
router.get("/:id/offer-letter", protect, getOfferLetterPdf);

// Admin
router.get("/admin", protect, requireAdmin, adminListApplications);
router.post("/admin/:id/action", protect, requireAdmin, adminUpdateApplicationStatus);
router.post("/admin/:id", protect, requireAdmin, adminUpdateApplicationStatus);
router.patch("/admin/:id", protect, requireAdmin, adminUpdateApplicationStatus);

export default router;
