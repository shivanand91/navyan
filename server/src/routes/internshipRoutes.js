import express from "express";
import {
  listPublishedInternships,
  getInternshipBySlug,
  adminListInternships,
  adminCreateInternship,
  adminUpdateInternship,
  adminDeleteInternship,
  adminReorderInternships
} from "../controllers/internshipController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public
router.get("/", listPublishedInternships);
router.get("/slug/:slug", getInternshipBySlug);

// Admin
router.get("/admin", protect, requireAdmin, adminListInternships);
router.patch("/admin/reorder", protect, requireAdmin, adminReorderInternships);
router.post("/admin", protect, requireAdmin, upload.single("coverImage"), adminCreateInternship);
router.put("/admin/:id", protect, requireAdmin, upload.single("coverImage"), adminUpdateInternship);
router.delete("/admin/:id", protect, requireAdmin, adminDeleteInternship);

export default router;
