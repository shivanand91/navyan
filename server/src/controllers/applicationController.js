import { Application } from "../models/Application.js";
import { Internship } from "../models/Internship.js";
import { PaymentAttempt } from "../models/PaymentAttempt.js";
import { Submission } from "../models/Submission.js";
import crypto from "crypto";
import { addMonths, addWeeks, format } from "date-fns";
import { createOfferLetterHtml, renderOfferLetterPdf } from "../services/pdfService.js";
import { getProfileCompletion } from "../utils/profileCompletion.js";
import {
  buildCertificateVerifyUrl,
  ensureCertificateForApplication
} from "../services/certificateService.js";
import {
  buildBlockingWorkflowResponse,
  findBlockingWorkflow
} from "../services/applicationAccessService.js";
import {
  findActiveReferralCodeByValue,
  incrementReferralUsage
} from "./referralController.js";
import {
  sendApplicationReceivedEmail,
  sendApplicationStatusEmail
} from "../services/emailService.js";
import {
  getTimelineState,
  syncApplicationLifecycle
} from "../services/applicationLifecycleService.js";
import { buildUpiPaymentPayload, getDurationPricing } from "../services/paymentService.js";
import {
  resolveAssignedTaskPdfUrl,
  resolveInternshipDomainLabel,
  shouldExposeAssignedTask
} from "../services/taskAssignmentService.js";
import { buildServerUrl, normalizeServerDocumentUrl } from "../utils/origin.js";

const PAYMENT_CONFIRMATION_WINDOW_SECONDS = 60;
const PAYMENT_INTENT_TTL_MINUTES = 30;
const UPI_UTR_REGEX = /^\d{12}$/;

const createPaymentReference = (internshipId, durationKey) =>
  `NAVPAY-${durationKey.toUpperCase()}-${String(internshipId).slice(-4).toUpperCase()}-${Date.now()}`;

const normalizeUtr = (value) => String(value || "").replace(/\D/g, "").trim();

const getDurationLabel = (application) => {
  const durationOption = application.internship?.durations?.find(
    (item) => item.key === application.durationKey
  );

  return (
    durationOption?.label ||
    (application.durationKey === "4-weeks"
      ? "4 weeks"
      : application.durationKey === "3-months"
        ? "3 months"
        : "6 months")
  );
};

const createOfferLetterAccessToken = () => crypto.randomBytes(24).toString("hex");

const ensureOfferLetterAccessToken = (application) => {
  const existingToken = application.offerLetter?.accessToken;
  if (existingToken) {
    return existingToken;
  }

  application.offerLetter = {
    ...(application.offerLetter || {}),
    accessToken: createOfferLetterAccessToken()
  };

  return application.offerLetter.accessToken;
};

const getOfferLetterPublicPath = (application) =>
  `/api/applications/offer-letter/${ensureOfferLetterAccessToken(application)}`;

const getOfferLetterAbsoluteUrl = (req, application) =>
  buildServerUrl(req, getOfferLetterPublicPath(application));

const serializeOfferLetterForResponse = (application, req) => {
  if (!application.offerLetter) {
    return application.offerLetter;
  }

  return {
    id: application.offerLetter.id,
    accessToken: application.offerLetter.accessToken,
    mimeType: application.offerLetter.mimeType,
    issuedAt: application.offerLetter.issuedAt,
    url: getOfferLetterAbsoluteUrl(req, application)
  };
};

const getOfferLetterDocumentPayload = (application) => {
  const internship = application.internship;
  const user = application.user;
  const startDate = application.internshipMeta?.startDate
    ? new Date(application.internshipMeta.startDate)
    : new Date();
  const endDate = application.internshipMeta?.endDate
    ? new Date(application.internshipMeta.endDate)
    : application.durationKey === "4-weeks"
      ? addWeeks(startDate, 4)
      : application.durationKey === "3-months"
        ? addMonths(startDate, 3)
        : addMonths(startDate, 6);
  const durationOption = internship?.durations?.find((d) => d.key === application.durationKey);
  const offerId =
    application.offerLetter?.id ||
    `NAV-OFFER-${new Date().getFullYear()}-${String(application._id).slice(-6).toUpperCase()}`;

  return {
    offerId,
    startDate,
    endDate,
    durationLabel: getDurationLabel(application),
    htmlPayload: {
      offerId,
      studentName: user?.profile?.fullName || user?.fullName || "Student",
      internshipTitle: internship?.title || "Internship",
      role: internship?.role,
      durationLabel: getDurationLabel(application),
      mode: internship?.mode || "remote",
      startDateStr: format(startDate, "dd MMM yyyy"),
      endDateStr: format(endDate, "dd MMM yyyy"),
      issueDateStr: format(new Date(), "dd MMM yyyy"),
      internshipType: durationOption?.isPaid ? "Paid internship" : "Merit-based internship",
      organizationName: "Navyan"
    }
  };
};

const OFFER_LETTER_VISIBLE_STATUSES = new Set([
  "Selected",
  "In Progress",
  "Submission Pending",
  "Submitted",
  "Revision Requested",
  "Completed"
]);

const buildApplicationGroups = (applications) =>
  Object.values(
    applications.reduce((groups, application) => {
      const categoryLabel = resolveInternshipDomainLabel(application.internship);
      const categoryKey = categoryLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      if (!groups[categoryKey]) {
        groups[categoryKey] = {
          categoryKey,
          categoryLabel,
          applicationCount: 0,
          statusCounts: {},
          applications: []
        };
      }

      groups[categoryKey].applications.push(application);
      groups[categoryKey].applicationCount += 1;
      groups[categoryKey].statusCounts[application.status] =
        (groups[categoryKey].statusCounts[application.status] || 0) + 1;

      return groups;
    }, {})
  ).sort((left, right) => left.categoryLabel.localeCompare(right.categoryLabel));

const APPLICATION_BASE_SELECT = [
  "user",
  "internship",
  "durationKey",
  "motivation",
  "status",
  "internalNotes",
  "payment",
  "referral",
  "offerLetter",
  "internshipMeta",
  "submission",
  "certificate",
  "createdAt"
].join(" ");

const ADMIN_USER_SELECT = [
  "fullName",
  "email",
  "profile.fullName",
  "profile.phone",
  "profile.whatsapp",
  "profile.city",
  "profile.state",
  "profile.college",
  "profile.degree",
  "profile.branch",
  "profile.currentYear",
  "profile.graduationYear",
  "profile.skills",
  "profile.preferredRoles",
  "profile.prevInternshipExperience",
  "profile.dailyHours",
  "profile.hasLaptop",
  "profile.englishLevel",
  "profile.resumeUrl",
  "profile.portfolioUrl",
  "profile.githubUrl",
  "profile.linkedinUrl"
].join(" ");

const STUDENT_USER_SELECT = "fullName email";

const INTERNSHIP_SELECT = [
  "title",
  "role",
  "mode",
  "durations.key",
  "durations.label",
  "durations.isPaid",
  "durations.taskPdfUrl"
].join(" ");

const CERTIFICATE_SELECT = "certificateId completionDate role pdfUrl verifyUrl";

const SUBMISSION_HISTORY_SELECT = [
  "application",
  "attemptNumber",
  "studentName",
  "taskName",
  "taskNumber",
  "projectTitle",
  "codeLink",
  "liveDemoLink",
  "projects",
  "submittedAt",
  "reviewStatus"
].join(" ");

const normalizeView = (value) => (value === "summary" ? "summary" : "detail");

const syncApplicationsForListing = async (applications) => {
  const updates = [];

  for (const application of applications) {
    let changed = syncApplicationLifecycle(application);
    const shouldAssignTask = shouldExposeAssignedTask(application);
    const taskPdfUrl = shouldAssignTask
      ? resolveAssignedTaskPdfUrl({
          internship: application.internship,
          durationKey: application.durationKey,
          existingTaskPdfUrl: application.internshipMeta?.taskPdfUrl
        })
      : "";

    if (shouldAssignTask && taskPdfUrl && application.internshipMeta?.taskPdfUrl !== taskPdfUrl) {
      application.internshipMeta = {
        ...(application.internshipMeta || {}),
        taskPdfUrl
      };
      changed = true;
    }

    if (application.offerLetter?.id && !application.offerLetter?.accessToken) {
      ensureOfferLetterAccessToken(application);
      changed = true;
    }

    if (!changed) {
      continue;
    }

    const nextUpdate = { status: application.status };
    if (application.internshipMeta) {
      nextUpdate.internshipMeta = application.internshipMeta;
    }
    if (application.offerLetter) {
      nextUpdate.offerLetter = application.offerLetter;
    }

    updates.push({
      updateOne: {
        filter: { _id: application._id },
        update: { $set: nextUpdate }
      }
    });
  }

  if (updates.length > 0) {
    await Application.bulkWrite(updates);
  }
};

const loadSubmissionHistory = async (applicationIds) => {
  if (applicationIds.length === 0) {
    return {};
  }

  const submissions = await Submission.find({
    application: { $in: applicationIds }
  })
    .select(SUBMISSION_HISTORY_SELECT)
    .sort({ createdAt: -1 })
    .lean();

  return submissions.reduce((grouped, submission) => {
    const key = String(submission.application);

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(submission);
    return grouped;
  }, {});
};

const serializeCertificateForResponse = (certificate, req) => {
  if (!certificate) {
    return certificate;
  }

  return {
    ...certificate.toObject?.(),
    ...(!certificate.toObject ? certificate : {}),
    verifyUrl: buildCertificateVerifyUrl(req, certificate?.certificateId, certificate?.verifyUrl),
    pdfUrl: normalizeServerDocumentUrl(
      certificate?.pdfUrl,
      req,
      `/api/certificates/download/${certificate?.certificateId}`
    )
  };
};

const serializeApplicationForResponse = (application, req, options = {}) => {
  const { includeTimeline = false, includeSubmissions = false, submissionsByApplication = {} } = options;
  const applicationObject = application.toObject();

  return {
    ...applicationObject,
    offerLetter: serializeOfferLetterForResponse(application, req),
    certificate: serializeCertificateForResponse(application.certificate, req),
    domainLabel: resolveInternshipDomainLabel(application.internship),
    ...(includeTimeline ? { timeline: getTimelineState(application) } : {}),
    ...(includeSubmissions
      ? {
          studentName: req.user?.profile?.fullName || req.user?.fullName || "Student",
          submissions: submissionsByApplication[String(application._id)] || []
        }
      : {})
  };
};

export const createPaymentIntent = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { internshipId, durationKey } = req.body;

    if (!internshipId || !durationKey) {
      return res.status(400).json({ message: "Internship and duration are required" });
    }

    const internship = await Internship.findById(internshipId);
    if (!internship || !internship.isPublished || internship.isDeleted) {
      return res.status(404).json({ message: "Internship not found" });
    }

    const existingApplication = await Application.findOne({
      user: userId,
      internship: internshipId,
      durationKey
    });
    if (existingApplication) {
      return res.status(400).json({
        message: "You already have an application or payment review for this internship duration"
      });
    }

    await PaymentAttempt.updateMany(
      {
        user: userId,
        application: null,
        status: "Initiated"
      },
      { $set: { status: "Expired" } }
    );

    const blockingWorkflow = await findBlockingWorkflow(userId);
    if (blockingWorkflow) {
      return res.status(400).json(buildBlockingWorkflowResponse(blockingWorkflow));
    }

    const { duration, amount, isPaid } = getDurationPricing(internship, durationKey);
    if (!duration) {
      return res.status(400).json({ message: "Invalid duration selected" });
    }

    if (!isPaid) {
      return res.status(400).json({ message: "Payment is not required for this duration" });
    }

    const upiId = process.env.INTERNSHIP_PAYMENT_UPI_ID;
    if (!upiId) {
      return res.status(500).json({ message: "Payment configuration is missing" });
    }

    await PaymentAttempt.updateMany(
      {
        user: userId,
        internship: internshipId,
        durationKey,
        status: { $in: ["Initiated", "Submitted"] }
      },
      { $set: { status: "Expired" } }
    );

    const paymentReference = createPaymentReference(internshipId, durationKey);
    const { qrCodeDataUrl } = await buildUpiPaymentPayload({
      upiId,
      amount,
      paymentReference
    });

    const paymentAttempt = await PaymentAttempt.create({
      user: userId,
      internship: internshipId,
      durationKey,
      amount,
      paymentReference
    });

    res.status(201).json({
      paymentAttemptId: paymentAttempt._id,
      amount,
      paymentReference,
      qrCodeDataUrl,
      minimumConfirmationSeconds: PAYMENT_CONFIRMATION_WINDOW_SECONDS,
      issuedAt: paymentAttempt.createdAt,
      expiresNote:
        "Complete payment, wait briefly for the payment app to generate the UTR, then submit the 12-digit reference number."
    });
  } catch (err) {
    if (err?.code === 11000) {
      const blockingWorkflow = await findBlockingWorkflow(req.user._id);
      return res.status(400).json(
        buildBlockingWorkflowResponse(blockingWorkflow)
      );
    }
    next(err);
  }
};

export const applyToInternship = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      internshipId,
      durationKey,
      motivation,
      paymentAttemptId,
      utrNumber,
      referralCode
    } = req.body;

    if (!internshipId || !durationKey) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const completion = getProfileCompletion(req.user.profile);
    if (!completion.isEligibleToApply) {
      return res.status(400).json({
        message: "Complete your profile before applying to internships",
        completion
      });
    }

    const internship = await Internship.findById(internshipId);
    if (!internship || !internship.isPublished || internship.isDeleted) {
      return res.status(404).json({ message: "Internship not found" });
    }

    const { duration, amount, isPaid } = getDurationPricing(internship, durationKey);
    if (!duration) {
      return res.status(400).json({ message: "Invalid duration selected" });
    }

    const existing = await Application.findOne({
      user: userId,
      internship: internshipId,
      durationKey
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You already have an application for this internship" });
    }

    const blockingWorkflow = await findBlockingWorkflow(userId);
    if (blockingWorkflow) {
      return res.status(400).json(buildBlockingWorkflowResponse(blockingWorkflow));
    }

    let payment = {
      status: "Not Required"
    };
    let referral = null;

    if (referralCode) {
      const activeReferral = await findActiveReferralCodeByValue(referralCode);
      if (!activeReferral) {
        return res.status(400).json({
          message: "This referral code is invalid or no longer active."
        });
      }

      referral = {
        referralCode: activeReferral._id,
        code: activeReferral.code,
        ownerName: activeReferral.ownerName
      };
    }

    if (isPaid) {
      if (!paymentAttemptId || !utrNumber) {
        return res.status(400).json({
          message: "Payment and UTR number are required for paid internship durations"
        });
      }

      const normalizedUtr = normalizeUtr(utrNumber);
      if (!UPI_UTR_REGEX.test(normalizedUtr)) {
        return res.status(400).json({
          message: "Enter the 12-digit UPI reference number from your payment app"
        });
      }

      const paymentAttempt = await PaymentAttempt.findOne({
        _id: paymentAttemptId,
        user: userId,
        internship: internshipId,
        durationKey,
        status: "Initiated"
      });

      if (!paymentAttempt) {
        return res.status(400).json({ message: "Payment session expired. Generate a new QR and try again." });
      }

      const paymentAttemptAgeMs = Date.now() - new Date(paymentAttempt.createdAt).getTime();
      if (paymentAttemptAgeMs > PAYMENT_INTENT_TTL_MINUTES * 60 * 1000) {
        paymentAttempt.status = "Expired";
        await paymentAttempt.save();
        return res.status(400).json({
          message: "Payment session expired. Generate a fresh QR code and try again."
        });
      }

      if (paymentAttemptAgeMs < PAYMENT_CONFIRMATION_WINDOW_SECONDS * 1000) {
        return res.status(400).json({
          message: `Wait at least ${PAYMENT_CONFIRMATION_WINDOW_SECONDS} seconds after payment before entering the UTR`
        });
      }

      const duplicateUtr = await PaymentAttempt.findOne({
        utrNumber: normalizedUtr,
        _id: { $ne: paymentAttempt._id }
      });

      if (duplicateUtr) {
        return res.status(400).json({
          message: "This UTR is already linked to another payment attempt"
        });
      }

      paymentAttempt.utrNumber = normalizedUtr;
      paymentAttempt.status = "PendingVerification";
      paymentAttempt.submittedAt = new Date();
      await paymentAttempt.save();

      payment = {
        paymentAttempt: paymentAttempt._id,
        amount,
        utrNumber: paymentAttempt.utrNumber,
        paymentReference: paymentAttempt.paymentReference,
        status: "Pending"
      };
    }

    const application = await Application.create({
      user: userId,
      internship: internshipId,
      durationKey,
      motivation,
      status: "Under Review",
      payment,
      referral
    });

    if (payment.paymentAttempt) {
      await PaymentAttempt.findByIdAndUpdate(payment.paymentAttempt, {
        application: application._id
      });
    }

    if (referral?.referralCode) {
      await incrementReferralUsage(referral.referralCode);
    }

    await sendApplicationReceivedEmail({
      user: req.user,
      internship,
      durationKey
    });

    res.status(201).json({ application });
  } catch (err) {
    if (err?.code === 11000) {
      const blockingWorkflow = await findBlockingWorkflow(req.user._id);
      return res.status(400).json(
        buildBlockingWorkflowResponse(blockingWorkflow)
      );
    }
    next(err);
  }
};

export const listMyApplications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const view = normalizeView(req.query.view);
    const applications = await Application.find({ user: userId })
      .select(APPLICATION_BASE_SELECT)
      .populate({ path: "user", select: STUDENT_USER_SELECT })
      .populate({ path: "internship", select: INTERNSHIP_SELECT })
      .populate({ path: "certificate", select: CERTIFICATE_SELECT })
      .sort({ createdAt: -1 });

    await syncApplicationsForListing(applications);

    const submissionsByApplication =
      view === "detail"
        ? await loadSubmissionHistory(applications.map((application) => application._id))
        : {};

    const enrichedApplications = applications.map((application) =>
      serializeApplicationForResponse(application, req, {
        includeTimeline: true,
        includeSubmissions: view === "detail",
        submissionsByApplication
      })
    );

    res.json({ applications: enrichedApplications });
  } catch (err) {
    next(err);
  }
};

export const adminListApplications = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const view = normalizeView(req.query.view);
    const query = {};

    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .select(APPLICATION_BASE_SELECT)
      .populate({ path: "user", select: ADMIN_USER_SELECT })
      .populate({ path: "internship", select: INTERNSHIP_SELECT })
      .populate({ path: "certificate", select: CERTIFICATE_SELECT })
      .sort({ createdAt: -1 });

    await syncApplicationsForListing(applications);

    const normalizedSearch = typeof search === "string" ? search.trim().toLowerCase() : "";

    const filteredApplications = normalizedSearch
      ? applications.filter((application) => {
          const haystack = [
            application.internalNotes,
            application.user?.fullName,
            application.user?.email,
            application.user?.profile?.phone,
            application.user?.profile?.whatsapp,
            application.user?.profile?.city,
            application.user?.profile?.state,
            application.user?.profile?.college,
            application.user?.profile?.degree,
            ...(application.user?.profile?.skills || []),
            ...(application.user?.profile?.preferredRoles || []),
            application.internship?.title,
            application.internship?.role,
            application.referral?.code,
            application.referral?.ownerName,
            application.durationKey,
            application.status
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(normalizedSearch);
        })
      : applications;

    res.json({
      applications: filteredApplications.map((application) =>
        serializeApplicationForResponse(application, req)
      ),
      ...(view === "detail" ? { groups: buildApplicationGroups(filteredApplications) } : {})
    });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, internalNotes, paymentDecision } = req.body;
    const warnings = [];

    const application = await Application.findById(id)
      .populate("user")
      .populate("internship")
      .populate("certificate");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const prevStatus = application.status;
    let generatedCertificate = null;
    if (internalNotes !== undefined) application.internalNotes = internalNotes;

    if (paymentDecision) {
      if (!application.payment?.paymentAttempt) {
        return res.status(400).json({ message: "No payment attempt is linked to this application" });
      }

      if (!["Verified", "Rejected"].includes(paymentDecision)) {
        return res.status(400).json({ message: "Invalid payment decision" });
      }

      const paymentAttempt = await PaymentAttempt.findById(application.payment.paymentAttempt);
      if (!paymentAttempt) {
        return res.status(404).json({ message: "Payment attempt not found" });
      }

      paymentAttempt.status = paymentDecision;
      paymentAttempt.reviewedAt = new Date();
      await paymentAttempt.save();

      application.payment.status = paymentDecision;

      if (paymentDecision === "Rejected") {
        application.status = "Rejected";
      }
    }

    const hasPaidPayment = application.payment?.status && application.payment.status !== "Not Required";
    const paymentVerified = ["Verified", "Linked"].includes(application.payment?.status);

    if (status) {
      if (
        hasPaidPayment &&
        !paymentVerified &&
        !["Applied", "Rejected"].includes(status)
      ) {
        return res.status(400).json({
          message: "Verify the paid application before moving it forward in the workflow"
        });
      }

      application.status = status;
    }

    // Phase 2: On Selected -> generate offer letter, assign task PDF, set dates
    if (prevStatus !== "Selected" && status === "Selected") {
      const internship = application.internship;
      const { offerId, startDate, endDate, htmlPayload } = getOfferLetterDocumentPayload(application);
      const fallbackOfferLetterUrl = getOfferLetterAbsoluteUrl(req, application);

      application.internshipMeta = {
        ...(application.internshipMeta || {}),
        startDate,
        endDate,
        taskPdfUrl: resolveAssignedTaskPdfUrl({
          internship,
          durationKey: application.durationKey,
          existingTaskPdfUrl: application.internshipMeta?.taskPdfUrl
        })
      };

      application.offerLetter = {
        id: offerId,
        accessToken: ensureOfferLetterAccessToken(application),
        mimeType: "application/pdf",
        url: fallbackOfferLetterUrl,
        issuedAt: new Date()
      };
    }

    if (status === "Completed") {
      generatedCertificate = await ensureCertificateForApplication(application, { req });
    }

    await application.save();

    if (application.status !== prevStatus) {
      try {
        await sendApplicationStatusEmail({
          user: application.user,
          internship: application.internship,
          durationKey: application.durationKey,
          status: application.status,
          previousStatus: prevStatus,
          offerLetterUrl: application.offerLetter?.id
            ? getOfferLetterAbsoluteUrl(req, application)
            : application.offerLetter?.url,
          taskPdfUrl: application.internshipMeta?.taskPdfUrl,
          certificateUrl: generatedCertificate?.pdfUrl || application.certificate?.pdfUrl
        });
      } catch (error) {
        warnings.push(
          "The status was updated, but the notification email could not be sent."
        );
        console.error("Application status email failed", error);
      }
    }

    res.json({ application, warnings });
  } catch (err) {
    next(err);
  }
};

export const getOfferLetterPdf = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("user")
      .populate("internship");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const isOwner = String(application.user?._id) === String(req.user?._id);
    if (!req.user || (!isOwner && req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!application.offerLetter?.id && !OFFER_LETTER_VISIBLE_STATUSES.has(application.status)) {
      return res.status(404).json({ message: "Offer letter not available yet" });
    }

    const { offerId, htmlPayload } = getOfferLetterDocumentPayload(application);
    const html = await createOfferLetterHtml(htmlPayload);
    const pdfBuffer = await renderOfferLetterPdf(html);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=\"${offerId}.pdf\"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

export const getPublicOfferLetterPdf = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      "offerLetter.accessToken": req.params.accessToken
    })
      .populate("user")
      .populate("internship");

    if (!application) {
      return res.status(404).json({ message: "Offer letter not found" });
    }

    if (!application.offerLetter?.id && !OFFER_LETTER_VISIBLE_STATUSES.has(application.status)) {
      return res.status(404).json({ message: "Offer letter not available yet" });
    }

    const { offerId, htmlPayload } = getOfferLetterDocumentPayload(application);
    const html = await createOfferLetterHtml(htmlPayload);
    const pdfBuffer = await renderOfferLetterPdf(html);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=\"${offerId}.pdf\"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};
