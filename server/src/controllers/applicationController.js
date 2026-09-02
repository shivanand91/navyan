import { Application } from "../models/Application.js";
import { User } from "../models/User.js";
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
  APPLICATION_BLOCKING_STATUSES,
  buildBlockingWorkflowResponse,
  findBlockingWorkflow
} from "../services/applicationAccessService.js";
import {
  findActiveReferralCodeByValue,
  incrementReferralUsage
} from "./referralController.js";
import { scheduleInternshipLifecycleEvents } from "../services/automationScheduler.js";
import {
  sendApplicationReceivedEmail,
  sendApplicationStatusEmail,
  sendTaskSubmissionReminderEmail
} from "../services/emailService.js";
import {
  getTimelineState,
  syncApplicationLifecycle
} from "../services/applicationLifecycleService.js";
import { buildUpiPaymentPayload, getDurationPricing } from "../services/paymentService.js";
import {
  resolveAssignedTaskPdfUrl,
  resolveInternshipDomainLabel,
  resolveInternshipRoleLabel,
  shouldExposeAssignedTask
} from "../services/taskAssignmentService.js";
import { buildClientUrl, buildServerUrl, normalizeServerDocumentUrl } from "../utils/origin.js";
import { ShareLink } from "../models/ShareLink.js";
import { ShareAttribution } from "../models/ShareAttribution.js";
import { ShareVisit } from "../models/ShareVisit.js";
import { creditShareRewardForApplication, reverseShareRewardForApplication } from "../services/shareEarnService.js";
import { getRequestIpHash } from "./shareEarnController.js";

const PAYMENT_CONFIRMATION_WINDOW_SECONDS = 60;
const PAYMENT_INTENT_TTL_MINUTES = 5;
const UPI_UTR_REGEX = /^\d{12}$/;

const createPaymentReference = (internshipId, durationKey) =>
  `NAVPAY-${durationKey.toUpperCase()}-${String(internshipId).slice(-4).toUpperCase()}-${Date.now()}`;

const normalizeUtr = (value) => String(value || "").replace(/\D/g, "").trim();

const getDurationLabel = (application) => {
  const durationOption = application.internship?.durations?.find(
    (item) => item.key === application.durationKey
  );

  if (durationOption?.label) return durationOption.label;

  const durationLabels = {
    "4-weeks": "4 weeks",
    "3-months": "3 months",
    "6-months": "6 months"
  };
  return durationLabels[application.durationKey] || application.durationKey;
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

const getOfferLetterPreviewAbsoluteUrl = (req, application) =>
  buildClientUrl(
    req,
    `/documents/offer-letter/${encodeURIComponent(ensureOfferLetterAccessToken(application))}`
  );

const getCertificatePreviewAbsoluteUrl = (req, certificate) =>
  certificate?.certificateId
    ? buildClientUrl(req, `/documents/certificate/${encodeURIComponent(certificate.certificateId)}`)
    : "";

const serializeOfferLetterForResponse = (application, req) => {
  if (!application.offerLetter) {
    return application.offerLetter;
  }

  return {
    id: application.offerLetter.id,
    accessToken: application.offerLetter.accessToken,
    mimeType: application.offerLetter.mimeType,
    issuedAt: application.offerLetter.issuedAt,
    url: getOfferLetterAbsoluteUrl(req, application),
    previewUrl: getOfferLetterPreviewAbsoluteUrl(req, application)
  };
};

const getOfferLetterDocumentPayload = (application) => {
  const internship = application.internship;
  const user = application.user;
  const startDate = application.internshipMeta?.startDate
    ? new Date(application.internshipMeta.startDate)
    : new Date();
  const calculateEndDate = (start, key) => {
    const match = key.match(/^(\d+)-(week|month|day|year)s?$/i) || key.match(/^(\d+)\s*(week|month|day|year)s?$/i);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      if (unit.startsWith("week")) return addWeeks(start, value);
      if (unit.startsWith("month")) return addMonths(start, value);
    }
    if (key === "4-weeks") return addWeeks(start, 4);
    if (key === "3-months") return addMonths(start, 3);
    if (key === "6-months") return addMonths(start, 6);
    return addMonths(start, 1);
  };

  const endDate = application.internshipMeta?.endDate
    ? new Date(application.internshipMeta.endDate)
    : calculateEndDate(startDate, application.durationKey);
  const pricing = getDurationPricing(internship, application.durationKey);
  const roleLabel = resolveInternshipRoleLabel(internship);
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
      role: roleLabel,
      durationLabel: getDurationLabel(application),
      mode: internship?.mode || "remote",
      startDateStr: format(startDate, "dd MMM yyyy"),
      endDateStr: format(endDate, "dd MMM yyyy"),
      issueDateStr: format(new Date(), "dd MMM yyyy"),
      internshipType: pricing.isPaid ? "Paid internship" : "Merit-based internship",
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
  "shareAttribution",
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
  "durations.price",
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

const serializeCertificateForResponse = (certificate, req, internship) => {
  if (!certificate) {
    return certificate;
  }

  return {
    ...certificate.toObject?.(),
    ...(!certificate.toObject ? certificate : {}),
    role: internship ? resolveInternshipRoleLabel(internship) : certificate?.role,
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
    certificate: serializeCertificateForResponse(application.certificate, req, application.internship),
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

    const completion = getProfileCompletion(req.user.profile);
    if (!completion.isEligibleToApply) {
      return res.status(400).json({
        message: "Complete your profile before generating a payment QR",
        completion,
        action: "COMPLETE_PROFILE"
      });
    }

    const internship = await Internship.findById(internshipId);
    if (!internship || !internship.isPublished || internship.isDeleted) {
      return res.status(404).json({ message: "Internship not found" });
    }

    const existingApplication = await Application.findOne({
      user: userId,
      internship: internshipId,
      durationKey,
      status: { $in: APPLICATION_BLOCKING_STATUSES }
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
      paymentReference,
      payeeName: "Navyan"
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
      expiresAt: new Date(
        new Date(paymentAttempt.createdAt).getTime() + PAYMENT_INTENT_TTL_MINUTES * 60 * 1000
      ),
      expiresInSeconds: PAYMENT_INTENT_TTL_MINUTES * 60,
      expiresNote:
        "QR code is valid for 5 minutes. If payment fails or the QR expires, generate a fresh QR and try again with the new payment reference."
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
      referralCode,
      shareToken
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
      durationKey,
      status: { $in: APPLICATION_BLOCKING_STATUSES }
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

    let shareAttribution = null;
    if (shareToken) {
      const shareLink = await ShareLink.findOne({ token: String(shareToken), internship: internshipId, isActive: true });
      const shareVisit = shareLink && req.cookies?.navyan_share_visitor
        ? await ShareVisit.findOne({ visitorToken: req.cookies.navyan_share_visitor, shareLink: shareLink._id, expiresAt: { $gt: new Date() } })
        : null;
      if (shareLink && shareVisit && String(shareLink.owner) !== String(userId)) {
        const isSameNetwork = shareLink.creatorIpHash && shareLink.creatorIpHash === getRequestIpHash(req);
        shareAttribution = await ShareAttribution.findOneAndUpdate(
          { referredUser: userId, internship: internshipId },
          { $setOnInsert: { shareLink: shareLink._id, owner: shareLink.owner, referredUser: userId, internship: internshipId, firstClickedAt: shareVisit.clickedAt, expiresAt: shareVisit.expiresAt, status: isSameNetwork ? "BLOCKED" : "ATTRIBUTED" } },
          { new: true, upsert: true }
        );
      }
    }

    const application = await Application.create({
      user: userId,
      internship: internshipId,
      durationKey,
      motivation,
      status: "Under Review",
      payment,
      referral,
      shareAttribution: shareAttribution?._id
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search;
    const status = req.query.status;
    const workflow = req.query.workflow;

    const query = {};

    let userIds = null;
    let internshipIds = null;

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      const [matchedUsers, matchedInternships] = await Promise.all([
        User.find({
          $or: [
            { fullName: searchRegex },
            { email: searchRegex },
            { "profile.phone": searchRegex },
            { "profile.whatsapp": searchRegex },
            { "profile.city": searchRegex },
            { "profile.state": searchRegex },
            { "profile.college": searchRegex },
            { "profile.degree": searchRegex }
          ]
        }).select("_id").lean(),
        Internship.find({
          $or: [
            { title: searchRegex },
            { role: searchRegex }
          ]
        }).select("_id").lean()
      ]);

      userIds = matchedUsers.map(u => u._id);
      internshipIds = matchedInternships.map(i => i._id);
    }

    if (status) {
      query.status = status;
    } else if (workflow) {
      if (workflow === "completed") {
        query.status = { $in: ["Completed", "Rejected"] };
      } else if (workflow === "inprogress") {
        query.status = { $in: ["Selected", "In Progress", "Submission Pending"] };
      } else if (workflow === "review") {
        query.$or = [
          { status: { $in: ["Submitted", "Revision Requested"] } },
          { "payment.status": "Pending" }
        ];
      } else if (workflow === "new") {
        query.status = { $nin: ["Completed", "Rejected", "Selected", "In Progress", "Submission Pending", "Submitted", "Revision Requested"] };
        query["payment.status"] = { $ne: "Pending" };
      }
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      const searchOrs = [
        { internalNotes: searchRegex },
        { durationKey: searchRegex },
        { status: searchRegex },
        { "referral.code": searchRegex },
        { "referral.ownerName": searchRegex }
      ];

      if (userIds && userIds.length > 0) {
        searchOrs.push({ user: { $in: userIds } });
      }
      if (internshipIds && internshipIds.length > 0) {
        searchOrs.push({ internship: { $in: internshipIds } });
      }

      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchOrs }
        ];
        delete query.$or;
      } else {
        query.$or = searchOrs;
      }
    }

    // Build the search counts base query
    const countBaseQuery = {};
    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      const searchOrs = [
        { internalNotes: searchRegex },
        { durationKey: searchRegex },
        { status: searchRegex },
        { "referral.code": searchRegex },
        { "referral.ownerName": searchRegex }
      ];
      if (userIds && userIds.length > 0) {
        searchOrs.push({ user: { $in: userIds } });
      }
      if (internshipIds && internshipIds.length > 0) {
        searchOrs.push({ internship: { $in: internshipIds } });
      }
      countBaseQuery.$or = searchOrs;
    }

    const [
      newCount,
      reviewCount,
      inprogressCount,
      completedCount,
      applications
    ] = await Promise.all([
      Application.countDocuments({
        ...countBaseQuery,
        status: { $nin: ["Completed", "Rejected", "Selected", "In Progress", "Submission Pending", "Submitted", "Revision Requested"] },
        "payment.status": { $ne: "Pending" }
      }),
      Application.countDocuments({
        ...countBaseQuery,
        $or: [
          { status: { $in: ["Submitted", "Revision Requested"] } },
          { "payment.status": "Pending" }
        ]
      }),
      Application.countDocuments({
        ...countBaseQuery,
        status: { $in: ["Selected", "In Progress", "Submission Pending"] }
      }),
      Application.countDocuments({
        ...countBaseQuery,
        status: { $in: ["Completed", "Rejected"] }
      }),
      Application.find(query)
        .select(APPLICATION_BASE_SELECT)
        .populate({ path: "user", select: ADMIN_USER_SELECT })
        .populate({ path: "internship", select: INTERNSHIP_SELECT })
        .populate({ path: "certificate", select: CERTIFICATE_SELECT })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
    ]);

    await syncApplicationsForListing(applications);

    let total = 0;
    if (workflow === "completed") total = completedCount;
    else if (workflow === "inprogress") total = inprogressCount;
    else if (workflow === "review") total = reviewCount;
    else if (workflow === "new") total = newCount;
    else total = newCount + reviewCount + inprogressCount + completedCount;

    res.json({
      applications: applications.map((application) =>
        serializeApplicationForResponse(application, req)
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      workflowCounts: {
        new: newCount,
        review: reviewCount,
        inprogress: inprogressCount,
        completed: completedCount
      }
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

    if (application.status === "Selected" && prevStatus !== "Selected") {
      await creditShareRewardForApplication(application);
    }
    if (application.status === "Rejected" && prevStatus !== "Rejected") {
      await reverseShareRewardForApplication(application);
    }

    // Trigger/Sync internship lifecycle automation events
    await scheduleInternshipLifecycleEvents(application._id);

    if (application.status !== prevStatus) {
      try {
        await sendApplicationStatusEmail({
          user: application.user,
          internship: application.internship,
          durationKey: application.durationKey,
          status: application.status,
          previousStatus: prevStatus,
          offerLetterUrl: application.offerLetter?.id
            ? getOfferLetterPreviewAbsoluteUrl(req, application)
            : application.offerLetter?.url,
          taskPdfUrl: application.internshipMeta?.taskPdfUrl,
          certificateUrl:
            getCertificatePreviewAbsoluteUrl(req, generatedCertificate || application.certificate) ||
            generatedCertificate?.pdfUrl ||
            application.certificate?.pdfUrl
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

export const getPublicOfferLetterPreview = async (req, res, next) => {
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

    const { offerId, startDate, endDate, htmlPayload } = getOfferLetterDocumentPayload(application);

    res.json({
      document: {
        ...htmlPayload,
        offerId,
        accessToken: application.offerLetter?.accessToken,
        status: application.status,
        durationKey: application.durationKey,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        taskPdfUrl: application.internshipMeta?.taskPdfUrl || "",
        pdfUrl: getOfferLetterAbsoluteUrl(req, application)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const sendTaskSubmissionReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id)
      .populate("user")
      .populate("internship");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const emailSent = await sendTaskSubmissionReminderEmail({
      user: application.user,
      application,
      internship: application.internship
    });

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send reminder email" });
    }

    res.json({
      success: true,
      message: "Task submission reminder email sent successfully"
    });
  } catch (err) {
    next(err);
  }
};
