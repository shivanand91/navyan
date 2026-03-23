import { Application } from "../models/Application.js";
import { Submission } from "../models/Submission.js";
import { ensureCertificateForApplication } from "../services/certificateService.js";
import { sendApplicationStatusEmail } from "../services/emailService.js";
import { getTimelineState, syncApplicationLifecycle } from "../services/applicationLifecycleService.js";

const ensureStudentApplication = async (applicationId, userId) => {
  const application = await Application.findOne({
    _id: applicationId,
    user: userId
  })
    .populate("user")
    .populate("internship")
    .populate("certificate")
    .populate("submission");

  return application;
};

export const listMySubmissionHistory = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = await ensureStudentApplication(applicationId, req.user._id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const submissions = await Submission.find({ application: application._id }).sort({
      createdAt: -1
    });
    res.json({ submissions });
  } catch (err) {
    next(err);
  }
};

export const submitProject = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { projectTitle, codeLink, liveDemoLink, driveLink, notes, confirmation } = req.body;

    const application = await ensureStudentApplication(applicationId, req.user._id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    syncApplicationLifecycle(application);
    const timeline = getTimelineState(application);
    const canSubmit =
      application.status === "Revision Requested" || timeline?.submissionWindowOpen;

    if (!canSubmit) {
      return res.status(400).json({
        message: "Submission window is not open yet. It opens 5 days before internship end date."
      });
    }

    if (!projectTitle || !codeLink || !confirmation) {
      return res.status(400).json({ message: "Project title, code link, and confirmation are required" });
    }

    const latestSubmission = await Submission.findOne({ application: application._id }).sort({
      attemptNumber: -1
    });

    const submission = await Submission.create({
      application: application._id,
      attemptNumber: (latestSubmission?.attemptNumber || 0) + 1,
      projectTitle,
      codeLink,
      liveDemoLink,
      driveLink,
      notes,
      reviewStatus: "Submitted"
    });

    application.submission = submission._id;
    application.status = "Submitted";
    await application.save();

    res.status(201).json({ submission });
  } catch (err) {
    next(err);
  }
};

export const adminListSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find()
      .populate({
        path: "application",
        populate: [
          { path: "user" },
          { path: "internship" },
          { path: "certificate" }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ submissions });
  } catch (err) {
    next(err);
  }
};

export const adminReviewSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, adminNotes } = req.body;

    const submission = await Submission.findById(id).populate({
      path: "application",
      populate: [
        { path: "user" },
        { path: "internship" },
        { path: "certificate" }
      ]
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.adminNotes = adminNotes ?? submission.adminNotes;

    const application = submission.application;
    const previousStatus = application.status;
    let generatedCertificate = null;

    if (action === "request-revision") {
      submission.reviewStatus = "Revision Requested";
      submission.revisionRequested = true;
      application.status = "Revision Requested";
    } else if (action === "complete") {
      submission.reviewStatus = "Completed";
      submission.revisionRequested = false;
      application.status = "Completed";
      generatedCertificate = await ensureCertificateForApplication(application);
    } else if (action === "reject") {
      submission.reviewStatus = "Rejected";
      application.status = "Rejected";
    } else {
      return res.status(400).json({ message: "Unsupported review action" });
    }

    await submission.save();
    await application.save();
    await sendApplicationStatusEmail({
      user: application.user,
      internship: application.internship,
      durationKey: application.durationKey,
      status: application.status,
      previousStatus,
      certificateUrl: generatedCertificate?.pdfUrl
    });

    res.json({ submission });
  } catch (err) {
    next(err);
  }
};
