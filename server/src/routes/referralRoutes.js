import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import {
  createReferralCode,
  deleteReferralCode,
  listReferralCodes
} from "../controllers/referralController.js";

const router = express.Router();

router.get("/admin", protect, requireAdmin, listReferralCodes);
router.post("/admin", protect, requireAdmin, createReferralCode);
router.delete("/admin/:id", protect, requireAdmin, deleteReferralCode);

export default router;
