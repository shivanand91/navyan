import axios from "axios";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { sendBroadcastAlertEmail } from "./emailService.js";

const getOneSignalConfig = () => {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_API_KEY;
  const isConfigured = Boolean(appId && apiKey);
  return { appId, apiKey, isConfigured };
};

/**
 * Sends a notification to a specific user (In-App + Web Push + Optional Email)
 */
export const sendToUser = async ({
  userId,
  title,
  message,
  link = "",
  type = "General",
  sendEmail = false
}) => {
  try {
    // 1. Create In-App Notification in DB
    const inApp = await Notification.create({
      user: userId,
      title,
      message,
      link,
      type
    });

    // 2. Trigger OneSignal Push Notification
    const config = getOneSignalConfig();
    let pushSuccess = false;
    let providerMessageId = "";

    if (config.isConfigured) {
      try {
        const response = await axios.post(
          "https://onesignal.com/api/v1/notifications",
          {
            app_id: config.appId,
            headings: { en: title },
            contents: { en: message },
            url: link || undefined,
            include_aliases: { external_id: [String(userId)] },
            target_channel: "push"
          },
          {
            headers: {
              Authorization: `Key ${config.apiKey}`,
              "Content-Type": "application/json"
            }
          }
        );
        pushSuccess = response.status === 200 || response.status === 201;
        providerMessageId = response.data?.id || "";
      } catch (err) {
        console.error(`[OneSignal] Push failed for user ${userId}:`, err.message);
      }
    } else {
      console.warn(`[OneSignal] Configuration missing. Mocked Push to user ${userId}: "${title}"`);
      pushSuccess = true;
    }

    // 3. Optional Email Fallback via Resend
    if (sendEmail) {
      const student = await User.findById(userId);
      if (student?.email) {
        try {
          await sendBroadcastAlertEmail({
            user: student,
            subject: title,
            message,
            actionLabel: "Open Navyan",
            actionHref: link || process.env.CLIENT_URL || "https://navyan.online"
          });
        } catch (err) {
          console.error(`[Email Service] Fallback email failed for ${student.email}:`, err.message);
        }
      }
    }

    return { success: true, inAppId: inApp._id, pushSuccess, providerMessageId };
  } catch (error) {
    console.error("sendToUser Error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a broadcast campaign to all registered students
 */
export const sendBroadcast = async ({
  broadcastId,
  title,
  message,
  link = "",
  type = "General",
  sendEmail = false
}) => {
  try {
    // 1. Fetch all student users
    const students = await User.find({ role: "student" }).select("_id email fullName");
    if (students.length === 0) {
      return { total: 0, successful: 0, failed: 0 };
    }

    // 2. Create in-app notifications in bulk
    const inAppNotifications = students.map((student) => ({
      user: student._id,
      broadcastId,
      title,
      message,
      link,
      type
    }));
    await Notification.insertMany(inAppNotifications);

    // 3. Send Web Push to all subscribed users via OneSignal
    const config = getOneSignalConfig();
    let pushSuccess = false;

    if (config.isConfigured) {
      try {
        const response = await axios.post(
          "https://onesignal.com/api/v1/notifications",
          {
            app_id: config.appId,
            headings: { en: title },
            contents: { en: message },
            url: link || undefined,
            included_segments: ["All Subscribed Users"]
          },
          {
            headers: {
              Authorization: `Key ${config.apiKey}`,
              "Content-Type": "application/json"
            }
          }
        );
        pushSuccess = response.status === 200 || response.status === 201;
      } catch (err) {
        console.error("[OneSignal] Broadcast push failed:", err.message);
      }
    } else {
      console.warn(`[OneSignal] Configuration missing. Mocked Broadcast push: "${title}"`);
      pushSuccess = true;
    }

    // 4. Optional Email Fallback (batch chunk processing to avoid timeouts/overlimits)
    let emailSentCount = 0;
    if (sendEmail) {
      const BATCH_SIZE = 10;
      for (let i = 0; i < students.length; i += BATCH_SIZE) {
        const batch = students.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(
          batch.map((student) =>
            sendBroadcastAlertEmail({
              user: student,
              subject: title,
              message,
              actionLabel: "Open Navyan",
              actionHref: link || process.env.CLIENT_URL || "https://navyan.online"
            }).then(() => { emailSentCount++; })
          )
        );
      }
    }

    return {
      total: students.length,
      successful: pushSuccess ? students.length : 0,
      failed: pushSuccess ? 0 : students.length,
      emailsSent: emailSentCount
    };
  } catch (error) {
    console.error("sendBroadcast Error:", error);
    throw error;
  }
};
