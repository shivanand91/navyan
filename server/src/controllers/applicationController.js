import { Application } from "../models/Application.js";
import { Internship } from "../models/Internship.js";
import { PaymentAttempt } from "../models/PaymentAttempt.js";
import { Submission } from "../models/Submission.js";
import { addMonths, addWeeks, format } from "date-fns";
import { createOfferLetterHtml, renderOfferLetterPdf } from "../services/pdfService.js";
import { uploadBuffer } from "../services/cloudinaryUpload.js";
import { getProfileCompletion } from "../utils/profileCompletion.js";
import { ensureCertificateForApplication } from "../services/certificateService.js";
import {
  buildBlockingWorkflowResponse,
  findBlockingWorkflow
} from "../services/applicationAccessService.js";
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

const PAYMENT_CONFIRMATION_WINDOW_SECONDS = 60;
const PAYMENT_INTENT_TTL_MINUTES = 30;
const UPI_UTR_REGEX = /^\d{12}$/;

const createPaymentReference = (internshipId, durationKey) =>
  `NAVPAY-${durationKey.toUpperCase()}-${String(internshipId).slice(-4).toUpperCase()}-${Date.now()}`;

const normalizeUtr = (value) => String(value || "").replace(/\D/g, "").trim();

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
    const { internshipId, durationKey, motivation, paymentAttemptId, utrNumber } = req.body;

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
      payment
    });

    if (payment.paymentAttempt) {
      await PaymentAttempt.findByIdAndUpdate(payment.paymentAttempt, {
        application: application._id
      });
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
    const applications = await Application.find({ user: userId })
      .populate("internship")
      .populate("payment.paymentAttempt")
      .populate("submission")
      .populate("certificate")
      .sort({ createdAt: -1 });

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

      if (changed) {
        await application.save();
      }
    }

    const enrichedApplications = await Promise.all(
      applications.map(async (application) => {
        const submissions = await Submission.find({ application: application._id }).sort({
          createdAt: -1
        });

        return {
          ...application.toObject(),
          studentName: req.user?.profile?.fullName || req.user?.fullName || "Student",
          timeline: getTimelineState(application),
          submissions
        };
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
    const query = {};

    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate("user")
      .populate("internship")
      .populate("payment.paymentAttempt")
      .populate("submission")
      .populate("certificate")
      .sort({ createdAt: -1 });

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

      if (changed) {
        await application.save();
      }
    }

    const normalizedSearch = typeof search === "string" ? search.trim().toLowerCase() : "";

    const filteredApplications = normalizedSearch
      ? applications.filter((application) => {
          const haystack = [
            application.internalNotes,
            application.user?.fullName,
            application.user?.email,
            application.internship?.title,
            application.internship?.role,
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
      applications: filteredApplications.map((application) => ({
        ...application.toObject(),
        domainLabel: resolveInternshipDomainLabel(application.internship)
      })),
      groups: buildApplicationGroups(filteredApplications)
    });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, internalNotes, paymentDecision } = req.body;

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
      const user = application.user;

      const durationOption = internship?.durations?.find((d) => d.key === application.durationKey);
      const durationLabel =
        durationOption?.label ||
        (application.durationKey === "4-weeks"
          ? "4 weeks"
          : application.durationKey === "3-months"
            ? "3 months"
            : "6 months");

      const startDate = new Date();
      const endDate =
        application.durationKey === "4-weeks"
          ? addWeeks(startDate, 4)
          : application.durationKey === "3-months"
            ? addMonths(startDate, 3)
            : addMonths(startDate, 6);

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

      const offerId = `NAV-OFFER-${new Date().getFullYear()}-${String(application._id).slice(-6).toUpperCase()}`;

      const html = await createOfferLetterHtml({
        offerId,
        studentName: user?.profile?.fullName || user?.fullName || "Student",
        internshipTitle: internship?.title || "Internship",
        role: internship?.role,
        durationLabel,
        mode: internship?.mode || "remote",
        startDateStr: format(startDate, "dd MMM yyyy"),
        endDateStr: format(endDate, "dd MMM yyyy"),
        issueDateStr: format(new Date(), "dd MMM yyyy"),
        internshipType: durationOption?.isPaid ? "Paid internship" : "Merit-based internship",
        organizationName: "Navyan"
      });

      const pdfBuffer = await renderOfferLetterPdf(html);

      // Upload to Cloudinary as raw/pdf
      const uploaded = await uploadBuffer({
        buffer: pdfBuffer,
        mimetype: "application/pdf",
        folder: "navyan/offer-letters",
        publicId: offerId,
        resourceType: "raw"
      });

      application.offerLetter = {
        id: offerId,
        url: uploaded.url,
        issuedAt: new Date()
      };
    }

    if (status === "Completed") {
      generatedCertificate = await ensureCertificateForApplication(application);
    }

    await application.save();

    if (application.status !== prevStatus) {
      await sendApplicationStatusEmail({
        user: application.user,
        internship: application.internship,
        durationKey: application.durationKey,
        status: application.status,
        previousStatus: prevStatus,
        offerLetterUrl: application.offerLetter?.url,
        taskPdfUrl: application.internshipMeta?.taskPdfUrl,
        certificateUrl: generatedCertificate?.pdfUrl || application.certificate?.pdfUrl
      });
    }

    res.json({ application });
  } catch (err) {
    next(err);
  }
};
