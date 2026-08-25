import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import {
  getAutomationDashboard,
  grantExtension,
  manualOverride,
  triggerCron
} from "../controllers/automationController.js";

const router = express.Router();

// Publicly triggerable but secret-validated cron route
router.get("/cron", triggerCron);

// Protected admin endpoints
router.get("/dashboard", protect, requireAdmin, getAutomationDashboard);
router.post("/extend", protect, requireAdmin, grantExtension);
router.post("/override", protect, requireAdmin, manualOverride);

export default router;
