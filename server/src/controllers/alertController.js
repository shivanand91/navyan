import { User } from "../models/User.js";
import { sendBroadcastAlertEmail } from "../services/emailService.js";

const BATCH_SIZE = 10;

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const chunk = (items, size) => {
  const groups = [];

  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }

  return groups;
};

export const broadcastAlert = async (req, res, next) => {
  try {
    const subject = normalizeString(req.body.subject);
    const message = normalizeString(req.body.message);
    const actionLabel = normalizeString(req.body.actionLabel) || "Open link";
    const actionHref = normalizeString(req.body.actionHref);

    if (!subject || !message) {
      return res.status(400).json({
        message: "Subject and message are required."
      });
    }

    const students = await User.find({
      role: "student",
      email: { $exists: true, $ne: "" }
    })
      .select("fullName email profile")
      .sort({ createdAt: 1 });

    if (students.length === 0) {
      return res.status(200).json({
        message: "No student accounts found.",
        stats: { total: 0, sent: 0, failed: 0 }
      });
    }

    let sent = 0;
    let failed = 0;

    for (const batch of chunk(students, BATCH_SIZE)) {
      const results = await Promise.allSettled(
        batch.map((student) =>
          sendBroadcastAlertEmail({
            user: student,
            subject,
            message,
            actionLabel,
            actionHref
          })
        )
      );

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          sent += 1;
        } else {
          failed += 1;
        }
      });
    }

    return res.status(200).json({
      message: `Broadcast processed for ${students.length} students.`,
      stats: {
        total: students.length,
        sent,
        failed
      }
    });
  } catch (error) {
    next(error);
  }
};
