import { AdminActivity } from "../models/AdminActivity.js";
import { PaymentAttempt } from "../models/PaymentAttempt.js";
import { emitAdminActivity } from "../socket.js";

const EVENT_DEFINITIONS = {
  USER_VISIT: { category: "VISITOR", priority: "LOW", notify: false, retentionDays: 30 },
  USER_SIGNUP: { category: "USER", priority: "NORMAL", notify: true },
  USER_LOGIN: { category: "USER", priority: "NORMAL", notify: true },
  INTERNSHIP_VIEW: { category: "INTERNSHIP", priority: "LOW", notify: false, retentionDays: 30 },
  INTERNSHIP_QR_GENERATED: { category: "PAYMENT", priority: "NORMAL", notify: true },
  PAYMENT_RECEIVED: { category: "PAYMENT", priority: "NORMAL", notify: true },
  PAYMENT_ABANDONED: { category: "PAYMENT", priority: "NORMAL", notify: true },
  PAYMENT_VERIFIED: { category: "PAYMENT", priority: "HIGH", notify: true },
  APPLICATION_SUBMITTED: { category: "APPLICATION", priority: "NORMAL", notify: true },
  ENROLLMENT_APPROVED: { category: "ENROLLMENT", priority: "HIGH", notify: true },
  SHARE_LINK_GENERATED: { category: "SHARE_EARN", priority: "NORMAL", notify: true },
  SHARE_EARN_CONVERSION: { category: "SHARE_EARN", priority: "HIGH", notify: true },
  WITHDRAWAL_REQUESTED: { category: "WITHDRAWAL", priority: "HIGH", notify: true },
  WITHDRAWAL_APPROVED: { category: "WITHDRAWAL", priority: "HIGH", notify: true },
  WITHDRAWAL_REJECTED: { category: "WITHDRAWAL", priority: "NORMAL", notify: true }
};

export const ACTIVITY_EVENT_TYPES = Object.keys(EVENT_DEFINITIONS);

const paymentAbandonmentMinutes = () => {
  const configured = Number.parseInt(process.env.PAYMENT_ABANDONMENT_MINUTES, 10);
  return Number.isFinite(configured) && configured >= 5 ? configured : 15;
};

export const expireAbandonedPaymentAttempts = async () => {
  try {
    const cutoff = new Date(Date.now() - paymentAbandonmentMinutes() * 60 * 1000);
    const attempts = await PaymentAttempt.find({ status: "Initiated", createdAt: { $lte: cutoff } }).populate("user", "fullName").populate("internship", "title").limit(100);
    for (const attempt of attempts) {
      const result = await PaymentAttempt.updateOne({ _id: attempt._id, status: "Initiated" }, { $set: { status: "Expired" } });
      if (result.modifiedCount) {
        await trackActivity({
          eventType: "PAYMENT_ABANDONED", user: attempt.user, internship: attempt.internship,
          title: "Payment QR expired", message: `${attempt.user?.fullName || "A student"} did not complete payment for ${attempt.internship?.title || "an internship"}.`,
          link: "/admin/applications", metadata: { paymentAttemptId: String(attempt._id), amount: attempt.amount, timeoutMinutes: paymentAbandonmentMinutes() }
        });
      }
    }
    return attempts.length;
  } catch (error) {
    console.error("Payment activity monitor failed:", error.message);
    return 0;
  }
};

// Tracking must never change the outcome of the workflow that produced the event.
export const trackActivity = async ({ eventType, user, sessionId, internship, application, title, message, link, metadata = {}, dedupeKey, dedupeWindowMs = 0 }) => {
  try {
    const definition = EVENT_DEFINITIONS[eventType];
    if (!definition) return null;
    // The admin console is an observer of student activity, not a source of admin surveillance.
    if (user?.role === "admin") return null;

    const now = new Date();
    const payload = {
      eventType,
      category: definition.category,
      priority: definition.priority,
      user: user?._id || user || undefined,
      sessionId,
      internship: internship?._id || internship || undefined,
      application: application?._id || application || undefined,
      title,
      message,
      link,
      metadata,
      isNotification: definition.notify,
      dedupeKey,
      expiresAt: definition.retentionDays ? new Date(now.getTime() + definition.retentionDays * 86400000) : undefined
    };

    if (dedupeKey && dedupeWindowMs) {
      const after = new Date(now.getTime() - dedupeWindowMs);
      const duplicate = await AdminActivity.findOne({ dedupeKey, createdAt: { $gte: after } }).select("_id").lean();
      if (duplicate) return null;
    }

    const activity = await AdminActivity.create(payload);
    emitAdminActivity(activity.toObject());
    return activity;
  } catch (error) {
    console.error("Admin activity tracking failed:", error.message);
    return null;
  }
};
