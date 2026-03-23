import { Application } from "../models/Application.js";
import { PaymentAttempt } from "../models/PaymentAttempt.js";

export const APPLICATION_BLOCKING_STATUSES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Selected",
  "In Progress",
  "Submission Pending",
  "Submitted",
  "Revision Requested"
];

export const PAYMENT_BLOCKING_STATUSES = ["Initiated", "Submitted", "PendingVerification"];

const getDurationLabel = (internship, durationKey) => {
  const duration = internship?.durations?.find((item) => item.key === durationKey);
  return duration?.label || durationKey;
};

export const findBlockingWorkflow = async (userId) => {
  const application = await Application.findOne({
    user: userId,
    status: { $in: APPLICATION_BLOCKING_STATUSES }
  })
    .populate("internship")
    .sort({ createdAt: -1 });

  if (application) {
    return {
      type: "application",
      record: application
    };
  }

  const paymentAttempt = await PaymentAttempt.findOne({
    user: userId,
    status: { $in: PAYMENT_BLOCKING_STATUSES },
    $or: [{ application: { $exists: false } }, { application: null }]
  })
    .populate("internship")
    .sort({ createdAt: -1 });

  if (paymentAttempt) {
    return {
      type: "payment",
      record: paymentAttempt
    };
  }

  return null;
};

export const buildBlockingWorkflowResponse = (blockingWorkflow) => {
  if (!blockingWorkflow) {
    return {
      message: "You already have an active internship workflow."
    };
  }

  if (blockingWorkflow.type === "payment") {
    const paymentAttempt = blockingWorkflow.record;

    return {
      message: `You already have an active payment workflow for ${
        paymentAttempt?.internship?.title || "another internship"
      }. Complete or cancel that workflow before starting another internship application.`,
      activeWorkflow: {
        type: "payment",
        id: paymentAttempt._id,
        status: paymentAttempt.status,
        durationKey: paymentAttempt.durationKey,
        durationLabel: getDurationLabel(paymentAttempt.internship, paymentAttempt.durationKey),
        internshipId: paymentAttempt.internship?._id,
        internshipTitle: paymentAttempt.internship?.title || "Internship"
      }
    };
  }

  const application = blockingWorkflow.record;

  return {
    message: `You already have an active application for ${
      application?.internship?.title || "another internship"
    }. You can apply to a new internship only after your current one is completed or closed.`,
    activeWorkflow: {
      type: "application",
      id: application._id,
      status: application.status,
      durationKey: application.durationKey,
      durationLabel: getDurationLabel(application.internship, application.durationKey),
      internshipId: application.internship?._id,
      internshipTitle: application.internship?.title || "Internship"
    }
  };
};
