import { Broadcast } from "../models/Broadcast.js";
import { sendBroadcast } from "../services/notificationService.js";

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

export const broadcastAlert = async (req, res, next) => {
  try {
    const subject = normalizeString(req.body.subject);
    const message = normalizeString(req.body.message);
    const actionLabel = normalizeString(req.body.actionLabel) || "Open update";
    const actionHref = normalizeString(req.body.actionHref);
    const type = normalizeString(req.body.type) || "Announcement";
    // Bulk email disabled for alert broadcasts to preserve Resend limits. Dashboard Notification Bell is used.
    const sendEmail = false;

    if (!subject || !message) {
      return res.status(400).json({
        message: "Subject and message are required."
      });
    }

    // 1. Create campaign log record
    const campaign = await Broadcast.create({
      title: subject,
      message,
      link: actionHref,
      type,
      createdBy: req.user._id,
      status: "Sending"
    });

    // 2. Dispatch broadcast via NotificationService (In-App Dashboard Bell)
    const result = await sendBroadcast({
      broadcastId: campaign._id,
      title: subject,
      message,
      link: actionHref,
      type,
      sendEmail
    });

    // 3. Finalize campaign log metrics
    campaign.status = "Sent";
    campaign.totalRecipients = result.total;
    campaign.successfulDeliveries = result.successful;
    campaign.failedDeliveries = result.failed;
    campaign.sentAt = new Date();
    await campaign.save();

    return res.status(200).json({
      message: `Broadcast notification successfully delivered to ${result.inAppSent || result.total} student dashboard bell(s).`,
      stats: {
        total: result.total,
        sent: result.successful,
        failed: result.failed,
        inAppSent: result.inAppSent
      }
    });
  } catch (error) {
    next(error);
  }
};
