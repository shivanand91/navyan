import { Application } from "../models/Application.js";
import { AutomationEvent } from "../models/AutomationEvent.js";
import { AutomationLog } from "../models/AutomationLog.js";
import { PushSubscription } from "../models/PushSubscription.js";
import { User } from "../models/User.js";
import { scheduleInternshipLifecycleEvents, clearInternshipLifecycleEvents } from "../services/automationScheduler.js";
import { processPendingEvents } from "../services/automationWorker.js";
import { sendToUser } from "../services/notificationService.js";

/**
 * Retrieve automation dashboard metrics, upcoming reminders, and execution audit logs
 */
export const getAutomationDashboard = async (req, res, next) => {
  try {
    const applications = await Application.find({
      status: { $in: ["Selected", "In Progress", "Submission Pending", "Revision Requested"] }
    }).populate("user").populate("internship");

    const now = new Date();
    let remaining7 = 0;
    let remaining3 = 0;
    let remaining2 = 0;
    let remainingToday = 0;
    let overdueCount = 0;
    let autoRejectionEligible = 0;

    const overdueList = [];
    const autoRejectionList = [];

    applications.forEach((app) => {
      const endDate = app.extension?.granted && app.extension?.extendedEndDate
        ? new Date(app.extension.extendedEndDate)
        : (app.internshipMeta?.endDate ? new Date(app.internshipMeta.endDate) : null);

      if (!endDate) return;

      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7 && diffDays > 3) {
        remaining7++;
      } else if (diffDays <= 3 && diffDays > 2) {
        remaining3++;
      } else if (diffDays <= 2 && diffDays > 0) {
        remaining2++;
      } else if (diffDays <= 0) {
        if (endDate.toDateString() === now.toDateString()) {
          remainingToday++;
        }
        if (app.projectSubmissionStatus !== "Submitted") {
          overdueCount++;
          overdueList.push(app);

          const rejectTime = endDate.getTime() + 10 * 24 * 60 * 60 * 1000;
          if (now.getTime() >= rejectTime) {
            autoRejectionEligible++;
            autoRejectionList.push(app);
          }
        }
      }
    });

    const totalUsers = await User.countDocuments({ role: "student" });
    const pushEnabled = await PushSubscription.countDocuments({ isActive: true });
    const pushDisabled = await PushSubscription.countDocuments({ isActive: false });
    const neverAsked = Math.max(0, totalUsers - pushEnabled - pushDisabled);

    const upcomingEvents = await AutomationEvent.find({ status: "Pending" })
      .populate({ path: "application", populate: ["user", "internship"] })
      .sort({ scheduledFor: 1 })
      .limit(10);

    const recentLogs = await AutomationLog.find()
      .populate("user")
      .populate({ path: "application", populate: "internship" })
      .sort({ createdAt: -1 })
      .limit(15);

    res.status(200).json({
      summary: {
        remaining7,
        remaining3,
        remaining2,
        remainingToday,
        overdueCount,
        autoRejectionEligible,
        totalUsers,
        pushEnabled,
        pushDisabled,
        neverAsked
      },
      overdueList,
      autoRejectionList,
      upcomingEvents,
      recentLogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Grant a deadline extension to a student and reschedule automation lifecycle events
 */
export const grantExtension = async (req, res, next) => {
  try {
    const { applicationId, extensionDays, customDate, reason } = req.body;

    const application = await Application.findById(applicationId).populate("user");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const baseDate = application.internshipMeta?.endDate || new Date();
    let extendedEndDate = customDate ? new Date(customDate) : new Date(baseDate);

    if (extensionDays) {
      extendedEndDate.setDate(extendedEndDate.getDate() + parseInt(extensionDays));
    }

    // Set extension status
    application.extension = {
      granted: true,
      extendedEndDate,
      reason: reason || "Extension granted by Admin",
      grantedBy: req.user._id,
      grantedAt: new Date()
    };

    // If application was rejected, we restore it to In Progress/Submission Pending
    if (application.status === "Rejected") {
      application.status = "Submission Pending";
      application.rejectionReason = undefined;
      application.rejectedAt = undefined;
    }

    await application.save();

    // Reschedule all automation events
    await scheduleInternshipLifecycleEvents(application._id);

    await AutomationLog.create({
      application: application._id,
      user: application.user._id,
      eventType: "admin-extension",
      status: "Completed",
      message: `Admin granted extension to ${extendedEndDate.toDateString()}. Reason: ${reason}`
    });

    res.status(200).json({ message: "Extension granted successfully", application });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually trigger or override automation actions
 */
export const manualOverride = async (req, res, next) => {
  try {
    const { applicationId, action, reason } = req.body;

    const application = await Application.findById(applicationId).populate("user").populate("internship");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (action === "pause") {
      await clearInternshipLifecycleEvents(applicationId);
      await AutomationLog.create({
        application: applicationId,
        user: application.user._id,
        eventType: "manual-pause",
        status: "Completed",
        message: "Admin paused automation events for this student."
      });
    } else if (action === "resume") {
      await scheduleInternshipLifecycleEvents(applicationId);
      await AutomationLog.create({
        application: applicationId,
        user: application.user._id,
        eventType: "manual-resume",
        status: "Completed",
        message: "Admin resumed automation events for this student."
      });
    } else if (action === "remind-now") {
      // Instantly trigger a reminder
      await sendToUser({
        userId: application.user._id,
        title: `Reminder: ${application.internship.title} Deadline`,
        message: "Your project submission deadline is approaching. Please complete and submit your project.",
        link: "/student/dashboard",
        type: "Deadline",
        sendEmail: true
      });

      await AutomationLog.create({
        application: applicationId,
        user: application.user._id,
        eventType: "manual-reminder",
        status: "Completed",
        message: "Admin manually sent immediate project deadline reminder."
      });
    } else if (action === "reject") {
      application.status = "Rejected";
      application.rejectionReason = reason || "Manually rejected by Admin";
      application.rejectedAt = new Date();
      await application.save();

      await clearInternshipLifecycleEvents(applicationId);

      await sendToUser({
        userId: application.user._id,
        title: "Navyan Internship Application Closed",
        message: `Your application has been manually updated to Rejected. Reason: ${application.rejectionReason}`,
        link: "/student/dashboard",
        type: "Important",
        sendEmail: true
      });

      await AutomationLog.create({
        application: applicationId,
        user: application.user._id,
        eventType: "manual-rejection",
        status: "Completed",
        message: `Admin manually rejected student application. Reason: ${reason}`
      });
    } else if (action === "restore") {
      application.status = "Submission Pending";
      application.rejectionReason = undefined;
      application.rejectedAt = undefined;
      await application.save();

      await scheduleInternshipLifecycleEvents(applicationId);

      await AutomationLog.create({
        application: applicationId,
        user: application.user._id,
        eventType: "manual-restore",
        status: "Completed",
        message: "Admin restored rejected application to active status."
      });
    }

    res.status(200).json({ message: `Action '${action}' executed successfully.` });
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint for cron schedule runners
 */
export const triggerCron = async (req, res, next) => {
  try {
    const headerSecret = req.headers["x-cron-secret"];
    const querySecret = req.query.secret;
    const expectedSecret = process.env.CRON_SECRET || "dev_cron_secret";

    if (headerSecret !== expectedSecret && querySecret !== expectedSecret) {
      return res.status(403).json({ message: "Forbidden: Invalid CRON secret" });
    }

    const result = await processPendingEvents();
    res.status(200).json({ message: "Cron processing completed", result });
  } catch (error) {
    next(error);
  }
};
