import { Application } from "../models/Application.js";
import { Submission } from "../models/Submission.js";
import { ensureCertificateForApplication } from "../services/certificateService.js";
import { sendApplicationStatusEmail } from "../services/emailService.js";
import { syncApplicationLifecycle } from "../services/applicationLifecycleService.js";

const SUBMISSION_ALLOWED_STATUSES = [
  "Selected",
  "In Progress",
  "Submission Pending",
  "Submitted",
  "Revision Requested"
];
const REQUIRED_PROJECT_COUNT = 3;

const normalizeProjectEntries = (projects = []) =>
  Array.from({ length: REQUIRED_PROJECT_COUNT }, (_, index) => ({
    projectName: String(projects[index]?.projectName || "").trim(),
    codeLink: String(projects[index]?.codeLink || "").trim(),
    liveDemoLink: String(projects[index]?.liveDemoLink || "").trim()
  }));

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
    const {
      studentName,
      taskName,
      taskNumber,
      projectTitle,
      codeLink,
      liveDemoLink,
      projects,
      driveLink,
      notes,
      confirmation
    } = req.body;

    const application = await ensureStudentApplication(applicationId, req.user._id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    syncApplicationLifecycle(application);
    const canSubmit = SUBMISSION_ALLOWED_STATUSES.includes(application.status);

    if (!canSubmit) {
      return res.status(400).json({
        message: "Task submission becomes available after you are selected for the internship."
      });
    }

    const resolvedStudentName = String(
      studentName || application.user?.profile?.fullName || application.user?.fullName || ""
    ).trim();
    const resolvedTaskName = String(
      taskName || projectTitle || application.internship?.role || application.internship?.title || ""
    ).trim();
    const resolvedTaskNumber = String(
      taskNumber || `TASK-${String(application._id).slice(-5).toUpperCase()}`
    ).trim();
    const normalizedProjects = normalizeProjectEntries(
      Array.isArray(projects) && projects.length
        ? projects
        : [
            {
              projectName: projectTitle,
              codeLink,
              liveDemoLink
            }
          ]
    );
    const hasAllProjects = normalizedProjects.every(
      (project) => project.projectName && project.codeLink
    );

    if (
      !resolvedStudentName ||
      !resolvedTaskName ||
      !resolvedTaskNumber ||
      !confirmation ||
      !hasAllProjects
    ) {
      return res.status(400).json({
        message:
          "Student name, task name, task number, and all 3 project entries with code links are required"
      });
    }

    const latestSubmission = await Submission.findOne({ application: application._id }).sort({
      attemptNumber: -1
    });

    const submission = await Submission.create({
      application: application._id,
      attemptNumber: (latestSubmission?.attemptNumber || 0) + 1,
      studentName: resolvedStudentName,
      taskName: resolvedTaskName,
      taskNumber: resolvedTaskNumber,
      projectTitle: normalizedProjects[0].projectName,
      codeLink: normalizedProjects[0].codeLink,
      liveDemoLink: normalizedProjects[0].liveDemoLink,
      projects: normalizedProjects,
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
      taskPdfUrl: application.internshipMeta?.taskPdfUrl,
      certificateUrl: generatedCertificate?.pdfUrl
    });

    res.json({ submission });
  } catch (err) {
    next(err);
  }
};
