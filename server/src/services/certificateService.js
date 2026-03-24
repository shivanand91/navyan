import QRCode from "qrcode";
import { format } from "date-fns";
import { Certificate } from "../models/Certificate.js";
import { uploadBuffer } from "./cloudinaryUpload.js";
import { createCertificateHtml, renderCertificatePdf } from "./pdfService.js";

const stripTrailingSlash = (value) =>
  typeof value === "string" ? value.trim().replace(/\/$/, "") : "";

const getServerOrigin = () =>
  stripTrailingSlash(process.env.SERVER_ORIGIN) || "http://localhost:5000";

const getDurationLabel = (application) => {
  const durationOption = application.internship?.durations?.find(
    (item) => item.key === application.durationKey
  );

  return durationOption?.label || application.durationKey;
};

export const ensureCertificateForApplication = async (application) => {
  if (application.certificate) {
    const existing = await Certificate.findById(application.certificate);
    if (existing) {
      return existing;
    }
  }

  const existingCertificate = await Certificate.findOne({ application: application._id });
  if (existingCertificate) {
    application.certificate = existingCertificate._id;
    await application.save();
    return existingCertificate;
  }

  const certificateId = `NAV-CERT-${new Date().getFullYear()}-${String(application._id)
    .slice(-6)
    .toUpperCase()}`;
  const verifyBaseUrl =
    stripTrailingSlash(process.env.CERTIFICATE_VERIFY_BASE_URL) ||
    `${stripTrailingSlash(process.env.CLIENT_URL) || "http://localhost:5173"}/verify-certificate`;
  const verifyUrl = `${verifyBaseUrl}?cid=${certificateId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);
  const completionDate = new Date();

  const html = await createCertificateHtml({
    certificateId,
    studentName:
      application.user?.profile?.fullName || application.user?.fullName || "Navyan Student",
    internshipTitle: application.internship?.title || "Internship",
    role: application.internship?.role || application.internship?.title || "Intern",
    durationLabel: getDurationLabel(application),
    completionDateStr: format(completionDate, "dd MMM yyyy"),
    issueDateStr: format(completionDate, "dd MMM yyyy"),
    organizationName: "Navyan",
    verifyUrl,
    qrCodeDataUrl
  });

  const pdfBuffer = await renderCertificatePdf(html);
  const uploaded = await uploadBuffer({
    buffer: pdfBuffer,
    mimetype: "application/pdf",
    folder: "navyan/certificates",
    publicId: certificateId,
    resourceType: "raw"
  });

  const certificate = await Certificate.create({
    application: application._id,
    user: application.user._id,
    internship: application.internship._id,
    fullName: application.user?.profile?.fullName || application.user?.fullName || "Navyan Student",
    role: application.internship?.role || application.internship?.title || "Intern",
    durationKey: application.durationKey,
    completionDate,
    issueDate: completionDate,
    certificateId,
    pdfUrl: uploaded.url || `${getServerOrigin()}/api/certificates/download/${certificateId}`,
    verifyUrl,
    verificationStatus: "Valid"
  });

  application.certificate = certificate._id;
  await application.save();

  return certificate;
};
