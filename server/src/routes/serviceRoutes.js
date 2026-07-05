import express from "express";
import {
  adminCreateService,
  adminDeleteService,
  adminListServices,
  adminUpdateService,
  listPublishedServices
} from "../controllers/serviceController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", listPublishedServices);

router.get("/admin", protect, requireAdmin, adminListServices);
router.post("/admin", protect, requireAdmin, upload.single("featureImage"), adminCreateService);
router.put("/admin/:id", protect, requireAdmin, upload.single("featureImage"), adminUpdateService);
router.delete("/admin/:id", protect, requireAdmin, adminDeleteService);

export default router;
