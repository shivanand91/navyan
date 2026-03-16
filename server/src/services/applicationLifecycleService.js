import { addDays, differenceInCalendarDays, isAfter } from "date-fns";

const ACTIVE_STATUSES = new Set(["Selected", "In Progress", "Submission Pending"]);

export const syncApplicationLifecycle = (application) => {
  const startDate = application?.internshipMeta?.startDate
    ? new Date(application.internshipMeta.startDate)
    : null;
  const endDate = application?.internshipMeta?.endDate
    ? new Date(application.internshipMeta.endDate)
    : null;

  if (!startDate || !endDate || !ACTIVE_STATUSES.has(application.status)) {
    return false;
  }

  const now = new Date();
  const submissionWindowStart = addDays(endDate, -5);
  let nextStatus = application.status;

  if (isAfter(now, endDate)) {
    nextStatus = application.submission ? "Submitted" : "Submission Pending";
  } else if (now >= submissionWindowStart) {
    nextStatus = application.submission ? "Submitted" : "Submission Pending";
  } else {
    nextStatus = "In Progress";
  }

  if (application.status !== nextStatus) {
    application.status = nextStatus;
    return true;
  }

  return false;
};

export const getTimelineState = (application) => {
  const startDate = application?.internshipMeta?.startDate
    ? new Date(application.internshipMeta.startDate)
    : null;
  const endDate = application?.internshipMeta?.endDate
    ? new Date(application.internshipMeta.endDate)
    : null;

  if (!startDate || !endDate) {
    return null;
  }

  const today = new Date();
  const totalDays = Math.max(1, differenceInCalendarDays(endDate, startDate));
  const daysLeft = Math.max(0, differenceInCalendarDays(endDate, today));
  const elapsedDays = Math.max(0, totalDays - daysLeft);
  const submissionWindowOpen = today >= addDays(endDate, -5);

  return {
    totalDays,
    daysLeft,
    elapsedDays,
    progressPercentage: Math.min(100, Math.round((elapsedDays / totalDays) * 100)),
    submissionWindowOpen
  };
};
