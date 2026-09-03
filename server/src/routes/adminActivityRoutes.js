import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { getActivityAnalytics, getAdminActivity, getAdminNotifications, getAdminUnreadCounts, getPaymentFunnel, markAdminNotificationRead, markAllAdminNotificationsRead } from "../controllers/adminActivityController.js";

const router = express.Router();
router.use(protect, requireAdmin);
router.get("/notifications", getAdminNotifications);
router.get("/notifications/unread-count", getAdminUnreadCounts);
router.patch("/notifications/read-all", markAllAdminNotificationsRead);
router.patch("/notifications/:id/read", markAdminNotificationRead);
router.get("/activity", getAdminActivity);
router.get("/activity/analytics", getActivityAnalytics);
router.get("/payment-funnel", getPaymentFunnel);
export default router;
