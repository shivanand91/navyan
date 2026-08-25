import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  registerPushSubscription,
  getMyNotifications,
  markNotificationsAsRead
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/subscription", protect, registerPushSubscription);
router.get("/", protect, getMyNotifications);
router.post("/mark-read", protect, markNotificationsAsRead);

export default router;
