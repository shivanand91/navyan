import { AutomationEvent } from "../models/AutomationEvent.js";
import { Application } from "../models/Application.js";
import { AutomationLog } from "../models/AutomationLog.js";
import { sendToUser } from "./notificationService.js";
import { expireAbandonedPaymentAttempts } from "./adminActivityService.js";

/**
 * Validates, executes, and logs all pending automation events that are due
 */
export const processPendingEvents = async () => {
  try {
    const now = new Date();
    const pendingEvents = await AutomationEvent.find({
      status: "Pending",
      scheduledFor: { $lte: now }
    }).limit(50); // Process in manageable batches

    if (pendingEvents.length === 0) {
      return { processed: 0 };
    }

    console.log(`[Automation Worker] Found ${pendingEvents.length} pending events to process.`);

    let processedCount = 0;

    for (const event of pendingEvents) {
      // Avoid double-processing: immediately mark as Processing
      event.status = "Processing";
      await event.save();

      const application = await Application.findById(event.application)
        .populate("user")
        .populate("internship");

      if (!application || !application.user) {
        event.status = "Failed";
        event.error = "Application or user not found";
        await event.save();
        continue;
      }

      // Check if the event is still valid
      const ACTIVE_STATUSES = ["Selected", "In Progress", "Submission Pending", "Revision Requested"];
      const isStillActive = ACTIVE_STATUSES.includes(application.status);
      const isProjectSubmitted = application.projectSubmissionStatus === "Submitted";

      if (!isStillActive || isProjectSubmitted) {
        // Event is no longer relevant (e.g. completed, already submitted, or rejected)
        event.status = "Cancelled";
        await event.save();
        continue;
      }

      // Construct notification payload based on event type
      let title = "";
      let message = "";
      let type = "Deadline";
      let link = "/student/dashboard";
      let sendEmail = false;
      let isRejection = false;

      switch (event.eventType) {
        case "reminder-7-days":
          title = "Your internship ends in 7 days";
          message = "Please make sure you complete your pending tasks and prepare your project submission.";
          break;
        case "reminder-3-days":
          title = "⏰ 3 Days Remaining";
          message = "Your Navyan internship is ending soon. Please complete your project and prepare your final submission.";
          break;
        case "reminder-2-days":
          title = "⚠️ Only 2 Days Left";
          message = "Your internship deadline is approaching. Complete and submit your project before the deadline.";
          break;
        case "final-day":
          title = "🚨 Final Day";
          message = "Today is the final day of your Navyan internship. Submit your project before the deadline.";
          sendEmail = true;
          break;
        case "followup-3-days":
          title = "Internship Ended — Submission Overdue";
          message = "Your internship has ended. If you have not submitted your final project yet, please submit it as soon as possible.";
          sendEmail = true;
          break;
        case "auto-rejection-10-days":
          title = "Navyan Internship Closed";
          message = "We did not receive your required project submission within the allowed submission period. Your internship has been marked as Rejected.";
          type = "Important";
          sendEmail = true;
          isRejection = true;
          break;
        default:
          event.status = "Failed";
          event.error = `Unknown event type: ${event.eventType}`;
          await event.save();
          continue;
      }

      try {
        if (isRejection) {
          // Perform the DB update for auto-rejection
          application.status = "Rejected";
          application.rejectionReason = "Internship/project submission deadline expired without submission.";
          application.rejectedAt = new Date();
          await application.save();
        }

        // Deliver notifications (Web Push + In-App + Optional Email)
        const delivery = await sendToUser({
          userId: application.user._id,
          title,
          message,
          link,
          type,
          sendEmail
        });

        if (delivery.success) {
          event.status = "Completed";
          event.executedAt = new Date();
          await event.save();

          await AutomationLog.create({
            application: application._id,
            user: application.user._id,
            eventType: event.eventType,
            status: "Completed",
            message: `Successfully executed ${event.eventType}. ${isRejection ? "Application marked as Rejected." : ""}`
          });
        } else {
          throw new Error(delivery.error || "Delivery failed");
        }
      } catch (err) {
        event.attempts += 1;
        event.error = err.message;
        
        if (event.attempts >= 3) {
          event.status = "Failed";
        } else {
          event.status = "Pending"; // Retry on next iteration
        }
        await event.save();

        await AutomationLog.create({
          application: application._id,
          user: application.user._id,
          eventType: event.eventType,
          status: "Failed",
          error: err.message,
          message: `Attempt ${event.attempts} failed for ${event.eventType}`
        });
      }

      processedCount++;
    }

    return { processed: processedCount };
  } catch (error) {
    console.error("[Automation Worker] Error in processPendingEvents:", error);
    return { error: error.message };
  }
};

/**
 * Starts the worker loop for persistent server environments
 */
export const startAutomationWorker = () => {
  // Run processPendingEvents every 5 minutes
  setInterval(processPendingEvents, 5 * 60 * 1000);
  setInterval(expireAbandonedPaymentAttempts, 5 * 60 * 1000);
  void expireAbandonedPaymentAttempts();
  console.log("[Automation Worker] Initialized 5-minute background polling daemon.");
};
