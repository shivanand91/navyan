import { AdminActivity } from "../models/AdminActivity.js";
import { Withdrawal } from "../models/Withdrawal.js";

const startOfToday = () => { const date = new Date(); date.setHours(0, 0, 0, 0); return date; };
const toPage = (value) => Math.max(1, Number.parseInt(value, 10) || 1);
const toLimit = (value) => Math.min(100, Math.max(1, Number.parseInt(value, 10) || 30));

export const getAdminNotifications = async (req, res, next) => {
  try {
    const page = toPage(req.query.page);
    const limit = toLimit(req.query.limit);
    const query = { isNotification: true };
    if (req.query.category) query.category = req.query.category;
    if (req.query.unread === "true") query.isRead = false;
    const [notifications, total, unreadCount] = await Promise.all([
      AdminActivity.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AdminActivity.countDocuments(query),
      AdminActivity.countDocuments({ isNotification: true, isRead: false })
    ]);
    res.json({ notifications, unreadCount, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const getAdminUnreadCounts = async (req, res, next) => {
  try {
    const [unreadCount, pendingWithdrawals] = await Promise.all([
      AdminActivity.countDocuments({ isNotification: true, isRead: false }),
      Withdrawal.countDocuments({ status: { $in: ["PENDING", "PROCESSING"] } })
    ]);
    res.json({ unreadCount, pendingWithdrawals });
  } catch (error) { next(error); }
};

export const markAdminNotificationRead = async (req, res, next) => {
  try {
    await AdminActivity.updateOne({ _id: req.params.id, isNotification: true }, { $set: { isRead: true, readAt: new Date() } });
    res.json({ success: true });
  } catch (error) { next(error); }
};

export const markAllAdminNotificationsRead = async (req, res, next) => {
  try {
    await AdminActivity.updateMany({ isNotification: true, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
    res.json({ success: true });
  } catch (error) { next(error); }
};

export const getAdminActivity = async (req, res, next) => {
  try {
    const page = toPage(req.query.page);
    const limit = toLimit(req.query.limit);
    const query = {};
    if (req.query.eventType) query.eventType = req.query.eventType;
    if (req.query.category) query.category = req.query.category;
    if (req.query.userId) query.user = req.query.userId;
    if (req.query.internshipId) query.internship = req.query.internshipId;
    if (req.query.from || req.query.to) query.createdAt = { ...(req.query.from ? { $gte: new Date(req.query.from) } : {}), ...(req.query.to ? { $lte: new Date(req.query.to) } : {}) };
    const [activities, total] = await Promise.all([
      AdminActivity.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AdminActivity.countDocuments(query)
    ]);
    res.json({ activities, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const getActivityAnalytics = async (req, res, next) => {
  try {
    const from = startOfToday();
    const counts = await AdminActivity.aggregate([{ $match: { createdAt: { $gte: from } } }, { $group: { _id: "$eventType", count: { $sum: 1 } } }]);
    const byType = Object.fromEntries(counts.map(({ _id, count }) => [_id, count]));
    res.json({
      from,
      metrics: {
        visitors: byType.USER_VISIT || 0, signups: byType.USER_SIGNUP || 0, internshipViews: byType.INTERNSHIP_VIEW || 0,
        qrGenerated: byType.INTERNSHIP_QR_GENERATED || 0, payments: byType.PAYMENT_VERIFIED || 0,
        applications: byType.APPLICATION_SUBMITTED || 0, enrollments: byType.ENROLLMENT_APPROVED || 0,
        shareEarn: (byType.SHARE_LINK_GENERATED || 0) + (byType.SHARE_EARN_CONVERSION || 0), withdrawals: byType.WITHDRAWAL_REQUESTED || 0
      }
    });
  } catch (error) { next(error); }
};

export const getPaymentFunnel = async (req, res, next) => {
  try {
    const from = startOfToday();
    const counts = await AdminActivity.aggregate([{ $match: { createdAt: { $gte: from }, eventType: { $in: ["INTERNSHIP_QR_GENERATED", "PAYMENT_RECEIVED", "PAYMENT_VERIFIED", "ENROLLMENT_APPROVED"] } } }, { $group: { _id: "$eventType", count: { $sum: 1 } } }]);
    const byType = Object.fromEntries(counts.map(({ _id, count }) => [_id, count]));
    res.json({ qrGenerated: byType.INTERNSHIP_QR_GENERATED || 0, paymentReceived: byType.PAYMENT_RECEIVED || 0, paymentVerified: byType.PAYMENT_VERIFIED || 0, enrollmentApproved: byType.ENROLLMENT_APPROVED || 0 });
  } catch (error) { next(error); }
};
