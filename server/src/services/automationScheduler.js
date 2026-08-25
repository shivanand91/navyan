import { Application } from "../models/Application.js";
import { AutomationEvent } from "../models/AutomationEvent.js";

/**
 * Calculates a date offset set to 10:00 AM IST (04:30 AM UTC)
 */
const getScheduledTimeIST = (baseDate, daysOffset) => {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + daysOffset);
  date.setUTCHours(4, 30, 0, 0);
  return date;
};

/**
 * Schedules or reschedules all future lifecycle events for a given application
 */
export const scheduleInternshipLifecycleEvents = async (applicationId) => {
  try {
    const application = await Application.findById(applicationId);
    if (!application) {
      console.error(`[Automation] Application ${applicationId} not found`);
      return;
    }

    // Active lifecycle statuses where reminders are relevant
    const ACTIVE_STATUSES = ["Selected", "In Progress", "Submission Pending", "Revision Requested"];
    const isActive = ACTIVE_STATUSES.includes(application.status);

    // If application is no longer active (e.g. Completed, Rejected, Under Review)
    // then cancel all pending automation events.
    if (!isActive || application.projectSubmissionStatus === "Submitted") {
      const result = await AutomationEvent.deleteMany({
        application: applicationId,
        status: "Pending"
      });
      if (result.deletedCount > 0) {
        console.log(`[Automation] Cancelled ${result.deletedCount} pending events for application ${applicationId}`);
      }
      return;
    }

    // Determine the effective end date
    const endDate = application.extension?.granted && application.extension?.extendedEndDate
      ? application.extension.extendedEndDate
      : application.internshipMeta?.endDate;

    if (!endDate) {
      console.warn(`[Automation] No end date set for active application ${applicationId}`);
      return;
    }

    // Define the lifecycle events to schedule
    const eventDefinitions = [
      { eventType: "reminder-7-days", offset: -7 },
      { eventType: "reminder-3-days", offset: -3 },
      { eventType: "reminder-2-days", offset: -2 },
      { eventType: "final-day", offset: 0 },
      { eventType: "followup-3-days", offset: 3 },
      { eventType: "auto-rejection-10-days", offset: 10 }
    ];

    const now = new Date();

    for (const def of eventDefinitions) {
      const scheduledFor = getScheduledTimeIST(endDate, def.offset);

      // Only schedule/upsert events if their scheduled time is in the future
      if (scheduledFor > now) {
        await AutomationEvent.findOneAndUpdate(
          {
            application: applicationId,
            eventType: def.eventType
          },
          {
            $set: {
              scheduledFor,
              status: "Pending",
              attempts: 0,
              error: null
            }
          },
          { upsert: true, new: true }
        );
      } else {
        // If the date has already passed, delete any pending event of this type
        await AutomationEvent.deleteOne({
          application: applicationId,
          eventType: def.eventType,
          status: "Pending"
        });
      }
    }

    console.log(`[Automation] Synced lifecycle events for application ${applicationId} ending on ${endDate}`);
  } catch (error) {
    console.error(`[Automation] Error scheduling events for application ${applicationId}:`, error);
  }
};

/**
 * Convenience method to clear all events for an application
 */
export const clearInternshipLifecycleEvents = async (applicationId) => {
  try {
    await AutomationEvent.deleteMany({ application: applicationId });
    console.log(`[Automation] Cleared all automation events for application ${applicationId}`);
  } catch (error) {
    console.error(`[Automation] Error clearing events for ${applicationId}:`, error);
  }
};
