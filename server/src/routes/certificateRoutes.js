import express from "express";
import QRCode from "qrcode";
import { format } from "date-fns";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { Certificate } from "../models/Certificate.js";
import { User } from "../models/User.js";
import { Internship } from "../models/Internship.js";
import { Application } from "../models/Application.js";
import { buildCertificateVerifyUrl } from "../services/certificateService.js";
import { createCertificateHtml, renderCertificatePdf } from "../services/pdfService.js";
import { resolveInternshipRoleLabel } from "../services/taskAssignmentService.js";
import { buildServerUrl } from "../utils/origin.js";

const router = express.Router();
const durationLabels = {
  "4-weeks": "4 weeks",
  "3-months": "3 months",
  "6-months": "6 months"
};

const getCertificateRoleLabel = (certificate) =>
  certificate?.internship
    ? resolveInternshipRoleLabel(certificate.internship)
    : certificate?.role || "Intern";

const formatCertificateDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : format(date, "dd MMM yyyy");
};

const getCertificateTimeline = (certificate) => {
  const startDate = certificate?.application?.internshipMeta?.startDate;
  const endDate = certificate?.application?.internshipMeta?.endDate;

  return {
    startDate,
    endDate,
    startDateStr: formatCertificateDate(startDate),
    endDateStr: formatCertificateDate(endDate)
  };
};

// Phase 2 compatibility: allow student UI to load (returns empty until Phase 4 issues certs)
router.get("/me", protect, async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate("application")
      .populate("internship")
      .sort({ createdAt: -1 });
    res.json({
      certificates: certificates.map((certificate) => {
        const timeline = getCertificateTimeline(certificate);

        return {
          ...certificate.toObject(),
          role: getCertificateRoleLabel(certificate),
          startDate: timeline.startDate,
          endDate: timeline.endDate,
          startDateStr: timeline.startDateStr,
          endDateStr: timeline.endDateStr,
          pdfUrl: buildServerUrl(req, `/api/certificates/download/${certificate.certificateId}`),
          verifyUrl: buildCertificateVerifyUrl(req, certificate.certificateId, certificate.verifyUrl)
        };
      })
    });
  } catch (err) {
    next(err);
  }
});

const seedMockCertificates = async () => {
  try {
    const mockUsersData = [
      { fullName: "Aayushi Singh", email: "aayushi@example.com", passwordHash: "dummy", profile: { linkedinUrl: "https://linkedin.com/in/aayushisingh" } },
      { fullName: "Rahul Verma", email: "rahul@example.com", passwordHash: "dummy", profile: { linkedinUrl: "https://linkedin.com/in/rahulverma" } },
      { fullName: "Nikita Sharma", email: "nikita@example.com", passwordHash: "dummy", profile: { linkedinUrl: "https://linkedin.com/in/nikitasharma" } },
      { fullName: "Ankit Patel", email: "ankit@example.com", passwordHash: "dummy", profile: { linkedinUrl: "https://linkedin.com/in/ankitpatel" } }
    ];

    const users = [];
    for (const uData of mockUsersData) {
      let user = await User.findOne({ email: uData.email });
      if (!user) {
        user = await User.create(uData);
      } else if (!user.profile || !user.profile.linkedinUrl) {
        user.profile = {
          ...user.profile,
          ...uData.profile
        };
        await user.save();
      }
      users.push(user);
    }

    const mockInternshipsData = [
      { title: "Web Development", slug: "web-development", shortDescription: "Learn HTML/CSS, React, Node.js", role: "Web Developer", isPublished: true },
      { title: "Data Science", slug: "data-science", shortDescription: "Learn Python, Pandas, Machine Learning", role: "Data Scientist", isPublished: true },
      { title: "UI/UX Design", slug: "ui-ux-design", shortDescription: "Learn Figma, User Research, Wireframing", role: "UI/UX Designer", isPublished: true }
    ];

    const internships = [];
    for (const iData of mockInternshipsData) {
      let internship = await Internship.findOne({ slug: iData.slug });
      if (!internship) {
        internship = await Internship.create(iData);
      }
      internships.push(internship);
    }

    const roles = ["Web Developer", "Data Scientist", "UI/UX Designer", "Frontend Developer"];
    const names = ["Aayushi Singh", "Rahul Verma", "Nikita Sharma", "Ankit Patel"];

    for (let i = 0; i < 4; i++) {
      const user = users[i];
      const internship = internships[i % internships.length];
      
      let application = await Application.findOne({ user: user._id, internship: internship._id });
      if (!application) {
        application = await Application.create({
          user: user._id,
          internship: internship._id,
          durationKey: "4-weeks",
          status: "Completed",
          internshipMeta: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date()
          }
        });
      }

      const certificateId = `NAV-CERT-2026-MOCK0${i + 1}`;
      let certificate = await Certificate.findOne({ certificateId });
      if (!certificate) {
        await Certificate.create({
          application: application._id,
          user: user._id,
          internship: internship._id,
          fullName: names[i],
          role: roles[i],
          durationKey: "4-weeks",
          completionDate: new Date(),
          issueDate: new Date(),
          certificateId,
          pdfUrl: `/api/certificates/download/${certificateId}`,
          verifyUrl: `/verify-certificate?cid=${certificateId}`,
          verificationStatus: "Valid"
        });
      }
    }
  } catch (error) {
    console.error("Error seeding mock certificates:", error);
  }
};

router.get("/public", async (req, res, next) => {
  try {
    const certCount = await Certificate.countDocuments({ verificationStatus: "Valid" });
    if (certCount === 0) {
      await seedMockCertificates();
    }

    const { search } = req.query;
    let query = { verificationStatus: "Valid" };

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { fullName: { $regex: escapedSearch, $options: "i" } },
        { certificateId: { $regex: escapedSearch, $options: "i" } }
      ];
    }

    const certificates = await Certificate.find(query)
      .populate("application")
      .populate("internship")
      .populate({
        path: "user",
        select: "profile.linkedinUrl"
      })
      .sort({ completionDate: -1 })
      .limit(30);

    res.json({
      certificates: certificates.map((certificate) => {
        const timeline = getCertificateTimeline(certificate);

        return {
          _id: certificate._id,
          fullName: certificate.fullName,
          role: getCertificateRoleLabel(certificate),
          certificateId: certificate.certificateId,
          completionDate: certificate.completionDate,
          issueDate: certificate.issueDate || certificate.createdAt,
          pdfUrl: buildServerUrl(req, `/api/certificates/download/${certificate.certificateId}`),
          verifyUrl: buildCertificateVerifyUrl(req, certificate.certificateId, certificate.verifyUrl),
          linkedinUrl: certificate.user?.profile?.linkedinUrl || ""
        };
      })
    });
  } catch (err) {
    next(err);
  }
});

router.get("/admin", protect, requireAdmin, async (req, res, next) => {
  try {
    const certificates = await Certificate.find()
      .populate("application")
      .populate("user")
      .populate("internship")
      .sort({ createdAt: -1 });
    res.json({
      certificates: certificates.map((certificate) => {
        const timeline = getCertificateTimeline(certificate);

        return {
          ...certificate.toObject(),
          role: getCertificateRoleLabel(certificate),
          startDate: timeline.startDate,
          endDate: timeline.endDate,
          startDateStr: timeline.startDateStr,
          endDateStr: timeline.endDateStr,
          pdfUrl: buildServerUrl(req, `/api/certificates/download/${certificate.certificateId}`),
          verifyUrl: buildCertificateVerifyUrl(req, certificate.certificateId, certificate.verifyUrl)
        };
      })
    });
  } catch (err) {
    next(err);
  }
});

router.get("/download/:certificateId", async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate("application")
      .populate("internship")
      .populate("user");

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const verifyUrl = buildCertificateVerifyUrl(req, certificate.certificateId, certificate.verifyUrl);
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);
    const roleLabel = getCertificateRoleLabel(certificate);
    const timeline = getCertificateTimeline(certificate);
    const html = await createCertificateHtml({
      certificateId: certificate.certificateId,
      studentName: certificate.fullName,
      internshipTitle: certificate.internship?.title || roleLabel || "Internship",
      role: roleLabel,
      durationLabel: durationLabels[certificate.durationKey] || certificate.durationKey,
      startDateStr: timeline.startDateStr,
      endDateStr: timeline.endDateStr,
      completionDateStr: format(certificate.completionDate, "dd MMM yyyy"),
      issueDateStr: format(certificate.issueDate || certificate.createdAt, "dd MMM yyyy"),
      organizationName: "Navyan",
      verifyUrl,
      qrCodeDataUrl
    });
    const pdfBuffer = await renderCertificatePdf(html);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=\"${certificate.certificateId}.pdf\"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

router.get("/preview/:certificateId", async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate("application")
      .populate("internship")
      .populate("user");

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const verifyUrl = buildCertificateVerifyUrl(req, certificate.certificateId, certificate.verifyUrl);
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);
    const roleLabel = getCertificateRoleLabel(certificate);
    const timeline = getCertificateTimeline(certificate);

    res.json({
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.fullName,
        internshipTitle: certificate.internship?.title || roleLabel || "Internship",
        role: roleLabel,
        durationKey: certificate.durationKey,
        durationLabel: durationLabels[certificate.durationKey] || certificate.durationKey,
        startDate: timeline.startDateStr,
        endDate: timeline.endDateStr,
        startDateStr: timeline.startDateStr,
        endDateStr: timeline.endDateStr,
        completionDateStr: format(certificate.completionDate, "dd MMM yyyy"),
        issueDateStr: format(certificate.issueDate || certificate.createdAt, "dd MMM yyyy"),
        organizationName: "Navyan",
        verifyUrl,
        qrCodeDataUrl,
        verificationStatus: certificate.verificationStatus
      }
    });
  } catch (err) {
    next(err);
  }
});

// Public verification (Phase 4 will enrich output; Phase 2 keeps contract stable)
router.get("/verify/:certificateId", async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const certificate = await Certificate.findOne({ certificateId }).select(
      "fullName role durationKey completionDate issueDate certificateId verifyUrl pdfUrl verificationStatus internship application"
    )
      .populate("application")
      .populate("internship");
    if (!certificate) return res.status(404).json({ valid: false });
    const certificateObject = certificate.toObject();
    const timeline = getCertificateTimeline(certificate);
    res.json({
      valid: certificate.verificationStatus !== "Revoked",
      certificate: {
        ...certificateObject,
        application: undefined,
        internship: undefined,
        role: getCertificateRoleLabel(certificate),
        startDate: timeline.startDateStr,
        endDate: timeline.endDateStr,
        startDateStr: timeline.startDateStr,
        endDateStr: timeline.endDateStr,
        pdfUrl: buildServerUrl(req, `/api/certificates/download/${certificate.certificateId}`),
        verifyUrl: buildCertificateVerifyUrl(req, certificate.certificateId, certificate.verifyUrl)
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
