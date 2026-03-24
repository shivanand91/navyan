import express from "express";
import QRCode from "qrcode";
import { format } from "date-fns";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { Certificate } from "../models/Certificate.js";
import { createCertificateHtml, renderCertificatePdf } from "../services/pdfService.js";
import { normalizeServerDocumentUrl } from "../utils/origin.js";

const router = express.Router();
const durationLabels = {
  "4-weeks": "4 weeks",
  "3-months": "3 months",
  "6-months": "6 months"
};

// Phase 2 compatibility: allow student UI to load (returns empty until Phase 4 issues certs)
router.get("/me", protect, async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      certificates: certificates.map((certificate) => ({
        ...certificate.toObject(),
        pdfUrl: normalizeServerDocumentUrl(
          certificate.pdfUrl,
          req,
          `/api/certificates/download/${certificate.certificateId}`
        )
      }))
    });
  } catch (err) {
    next(err);
  }
});

router.get("/admin", protect, requireAdmin, async (req, res, next) => {
  try {
    const certificates = await Certificate.find()
      .populate("user")
      .populate("internship")
      .sort({ createdAt: -1 });
    res.json({
      certificates: certificates.map((certificate) => ({
        ...certificate.toObject(),
        pdfUrl: normalizeServerDocumentUrl(
          certificate.pdfUrl,
          req,
          `/api/certificates/download/${certificate.certificateId}`
        )
      }))
    });
  } catch (err) {
    next(err);
  }
});

router.get("/download/:certificateId", async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate("internship")
      .populate("user");

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const verifyUrl =
      certificate.verifyUrl ||
      `${
        (typeof process.env.CERTIFICATE_VERIFY_BASE_URL === "string"
          ? process.env.CERTIFICATE_VERIFY_BASE_URL.trim().replace(/\/$/, "")
          : "") || "http://localhost:5173/verify-certificate"
      }?cid=${certificate.certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);
    const html = await createCertificateHtml({
      certificateId: certificate.certificateId,
      studentName: certificate.fullName,
      internshipTitle: certificate.internship?.title || certificate.role || "Internship",
      role: certificate.role || certificate.internship?.role || "Intern",
      durationLabel: durationLabels[certificate.durationKey] || certificate.durationKey,
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

// Public verification (Phase 4 will enrich output; Phase 2 keeps contract stable)
router.get("/verify/:certificateId", async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const certificate = await Certificate.findOne({ certificateId }).select(
      "fullName role durationKey completionDate issueDate certificateId verifyUrl pdfUrl verificationStatus"
    );
    if (!certificate) return res.status(404).json({ valid: false });
    res.json({
      valid: certificate.verificationStatus !== "Revoked",
      certificate: {
        ...certificate.toObject(),
        pdfUrl: normalizeServerDocumentUrl(
          certificate.pdfUrl,
          req,
          `/api/certificates/download/${certificate.certificateId}`
        )
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
