import { readFile } from "fs/promises";
import { generatePdfBufferFromHtml } from "../utils/pdf.js";

let cachedLogoDataUri = null;
const fallbackLogoDataUri = `data:image/svg+xml;base64,${Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="420" height="110" viewBox="0 0 420 110">
    <rect width="420" height="110" rx="28" fill="#111418" />
    <rect x="10" y="10" width="400" height="90" rx="22" fill="none" stroke="rgba(212,168,95,0.35)" />
    <circle cx="58" cy="55" r="22" fill="#d4a85f" />
    <path d="M48 66V44l19 22V44" fill="none" stroke="#111418" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    <text x="98" y="66" fill="#f5f7fa" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="6">NAVYAN</text>
  </svg>
`).toString("base64")}`;

const createSvgDataUri = (markup) =>
  `data:image/svg+xml;base64,${Buffer.from(markup).toString("base64")}`;

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getLogoDataUri = async () => {
  if (cachedLogoDataUri) return cachedLogoDataUri;

  const remoteLogoUrl = typeof process.env.DOCUMENT_LOGO_URL === "string"
    ? process.env.DOCUMENT_LOGO_URL.trim()
    : "";

  if (remoteLogoUrl) {
    cachedLogoDataUri = remoteLogoUrl;
    return cachedLogoDataUri;
  }

  const logoPathCandidates = [
    process.env.DOCUMENT_LOGO_PATH,
    new URL("../../../client/src/assests/Navyan.svg", import.meta.url)
  ].filter(Boolean);

  for (const candidate of logoPathCandidates) {
    try {
      const logoSvg = await readFile(candidate, "utf8");
      cachedLogoDataUri = createSvgDataUri(logoSvg);
      return cachedLogoDataUri;
    } catch {
      // Try the next configured logo path.
    }
  }

  cachedLogoDataUri = fallbackLogoDataUri;
  return cachedLogoDataUri;
};

const getSignatureDataUri = (name, tone = "#1f1728") =>
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="560" height="120" viewBox="0 0 560 120">
      <defs>
        <linearGradient id="ink" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${tone}" />
          <stop offset="100%" stop-color="#6d28d9" />
        </linearGradient>
      </defs>
      <path d="M24 92 C88 50, 170 42, 252 64 S416 104, 534 70" fill="none" stroke="rgba(212,168,95,0.22)" stroke-width="5" stroke-linecap="round"/>
      <text
        x="14"
        y="78"
        fill="url(#ink)"
        font-family="'Brush Script MT', 'Segoe Script', 'Lucida Handwriting', cursive"
        font-size="46"
        font-weight="600"
        letter-spacing="1"
      >${escapeHtml(name)}</text>
    </svg>
  `);

const founderSignatureDataUri = getSignatureDataUri("Shivanand Kumar", "#2d1d0a");
const coFounderSignatureDataUri = getSignatureDataUri("Anamika Pandey", "#31154f");

export const createOfferLetterHtml = async ({
  offerId,
  studentName,
  internshipTitle,
  role,
  durationLabel,
  mode,
  startDateStr,
  endDateStr,
  issueDateStr,
  internshipType,
  organizationName
}) => {
  const logoDataUri = await getLogoDataUri();

  return `<!doctype html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        @page { size: A4 portrait; margin: 0; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
          color: #111827;
          background: #f6f1e7;
        }
        .page {
          position: relative;
          width: 100%;
          padding: 24px 24px 18px;
          background:
            radial-gradient(circle at top right, rgba(212,168,95,0.14), transparent 28%),
            linear-gradient(180deg, #fffdf8 0%, #f8f3eb 100%);
          border: 1px solid rgba(200,169,107,0.28);
          border-radius: 24px;
        }
        .page::before {
          content: "";
          position: absolute;
          inset: 12px;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 18px;
          pointer-events: none;
        }
        .watermark {
          position: absolute;
          right: 20px;
          top: 24px;
          width: 132px;
          opacity: 0.05;
        }
        .header {
          position: relative;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo {
          width: 70px;
          height: auto;
          object-fit: contain;
        }
        .brand-name {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #2b2113;
        }
        .brand-subtitle {
          margin-top: 4px;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7c6b54;
        }
        .meta-card {
          min-width: 195px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 18px;
          box-shadow: 0 14px 28px rgba(15,23,42,0.05);
        }
        .meta-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #7c6b54;
          font-weight: 700;
        }
        .meta-value {
          margin-top: 4px;
          font-size: 12px;
          font-weight: 700;
          color: #111827;
        }
        .headline {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-end;
        }
        .title {
          margin: 0;
          font-size: 26px;
          line-height: 1.08;
          font-weight: 800;
          color: #14151a;
        }
        .subtitle {
          margin-top: 8px;
          max-width: 500px;
          font-size: 11.5px;
          line-height: 1.65;
          color: #4b5563;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(212,168,95,0.12);
          border: 1px solid rgba(200,169,107,0.32);
          color: #6d4e14;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .summary-grid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        .summary-card {
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(15,23,42,0.08);
          background: rgba(255,255,255,0.82);
        }
        .summary-card .label {
          font-size: 9.5px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #7c6b54;
          font-weight: 700;
        }
        .summary-card .value {
          margin-top: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #111827;
        }
        .content {
          margin-top: 16px;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
          gap: 12px;
        }
        .panel {
          border-radius: 18px;
          border: 1px solid rgba(15,23,42,0.08);
          background: rgba(255,255,255,0.82);
          padding: 15px 16px;
        }
        .section-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #7c6b54;
          font-weight: 800;
        }
        .body {
          margin-top: 10px;
          font-size: 11.5px;
          line-height: 1.68;
          color: #374151;
        }
        .terms {
          margin: 10px 0 0;
          padding-left: 16px;
          color: #374151;
          font-size: 10.5px;
          line-height: 1.6;
        }
        .terms li { margin-bottom: 4px; }
        .signature-wrap {
          margin-top: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .signature {
          width: 168px;
          height: auto;
          max-width: 100%;
        }
        .sig-line {
          margin-top: 2px;
          padding-top: 6px;
          border-top: 1px solid rgba(15,23,42,0.18);
          font-size: 10.5px;
          color: #4b5563;
        }
        .sig-line strong {
          display: block;
          margin-bottom: 2px;
          color: #111827;
          font-size: 11.5px;
        }
        .footer {
          margin-top: 12px;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-end;
          font-size: 10px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <img src="${logoDataUri}" alt="Navyan watermark" class="watermark" />

        <div class="header">
          <div class="brand">
            <img src="${logoDataUri}" alt="Navyan logo" class="logo" />
            <div>
              <div class="brand-name">${escapeHtml(organizationName)}</div>
              <div class="brand-subtitle">Internship Offer Letter</div>
            </div>
          </div>

          <div class="meta-card">
            <div class="meta-label">Document ID</div>
            <div class="meta-value">${escapeHtml(offerId)}</div>
            <div class="meta-label" style="margin-top: 14px;">Issue date</div>
            <div class="meta-value">${escapeHtml(issueDateStr)}</div>
          </div>
        </div>

        <div class="headline">
          <div>
            <h1 class="title">Formal confirmation of your internship engagement with ${escapeHtml(
              organizationName
            )}</h1>
            <div class="subtitle">
              This document confirms your selection into a structured internship role with a defined
              timeline, assigned work, and performance-based evaluation.
            </div>
          </div>
          <div class="badge">${escapeHtml(internshipType || "Structured internship")}</div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Candidate</div>
            <div class="value">${escapeHtml(studentName)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Internship title</div>
            <div class="value">${escapeHtml(internshipTitle)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Assigned role</div>
            <div class="value">${escapeHtml(role || internshipTitle)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Mode</div>
            <div class="value">${escapeHtml((mode || "remote").toUpperCase())}</div>
          </div>
          <div class="summary-card">
            <div class="label">Duration</div>
            <div class="value">${escapeHtml(durationLabel)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Program window</div>
            <div class="value">${escapeHtml(startDateStr)} to ${escapeHtml(endDateStr)}</div>
          </div>
        </div>

        <div class="content">
          <div class="panel">
            <div class="section-label">Official note</div>
            <div class="body">
              Dear <strong>${escapeHtml(studentName)}</strong>,<br /><br />
              We are pleased to offer you an internship opportunity with <strong>${escapeHtml(
                organizationName
              )}</strong>. You have been selected for the role of
              <strong> ${escapeHtml(role || internshipTitle)}</strong> under the
              <strong> ${escapeHtml(internshipTitle)}</strong> program. Your internship will run for
              <strong> ${escapeHtml(durationLabel)}</strong>, beginning on
              <strong> ${escapeHtml(startDateStr)}</strong> and concluding on
              <strong> ${escapeHtml(endDateStr)}</strong>. You will receive project instructions,
              work against timelines, and be assessed on quality, consistency, communication, and
              completion of deliverables.
            </div>
          </div>

          <div class="panel">
            <div class="section-label">Terms and expectations</div>
            <ol class="terms">
              <li>The internship is governed by the structured workflow defined by ${escapeHtml(
                organizationName
              )}.</li>
              <li>You are expected to maintain timely communication and professional conduct.</li>
              <li>Project milestones, submissions, and revisions will be tracked through the platform.</li>
              <li>Offer letter, task assignment, and certificate issuance remain linked to verified progress.</li>
              <li>Serious misconduct or non-compliance may lead to discontinuation of the internship.</li>
            </ol>
          </div>
        </div>

        <div class="signature-wrap">
          <div class="signature-card">
            <img src="${founderSignatureDataUri}" alt="Shivanand Kumar signature" class="signature" />
            <div class="sig-line">
              <strong>Shivanand Kumar</strong>
              Founder, ${escapeHtml(organizationName)}
            </div>
          </div>
          <div class="signature-card">
            <img src="${coFounderSignatureDataUri}" alt="Anamika Pandey signature" class="signature" />
            <div class="sig-line">
              <strong>Anamika Pandey</strong>
              Co-Founder, ${escapeHtml(organizationName)}
            </div>
          </div>
        </div>

        <div class="footer">
          <span>Generated digitally by the Navyan internship workflow system.</span>
          <span>${escapeHtml(issueDateStr)}</span>
        </div>
      </div>
    </body>
  </html>`;
};

export const renderOfferLetterPdf = async (html) => {
  return await generatePdfBufferFromHtml(html, {
    margin: {
      top: "6mm",
      right: "6mm",
      bottom: "6mm",
      left: "6mm"
    }
  });
};

export const createCertificateHtml = async ({
  certificateId,
  studentName,
  internshipTitle,
  role,
  durationLabel,
  completionDateStr,
  issueDateStr,
  organizationName,
  verifyUrl,
  qrCodeDataUrl
}) => {
  const logoDataUri = await getLogoDataUri();

  return `<!doctype html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
          color: #111827;
          background: #f7f3eb;
        }
        .page {
          position: relative;
          padding: 28px;
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(212,168,95,0.16), transparent 26%),
            radial-gradient(circle at bottom right, rgba(109,40,217,0.08), transparent 24%),
            linear-gradient(180deg, #fffcf8 0%, #f8f3ea 100%);
          border: 1px solid rgba(200,169,107,0.28);
          border-radius: 28px;
          overflow: hidden;
        }
        .page::before {
          content: "";
          position: absolute;
          inset: 14px;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 22px;
          pointer-events: none;
        }
        .topbar {
          position: relative;
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: flex-start;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .logo {
          width: 92px;
          height: auto;
        }
        .brand-name {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #2b2113;
        }
        .brand-subtitle {
          margin-top: 6px;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #7c6b54;
        }
        .id-chip {
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(212,168,95,0.12);
          border: 1px solid rgba(200,169,107,0.28);
          color: #6d4e14;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .title-wrap {
          margin-top: 18px;
          text-align: center;
        }
        .eyebrow {
          font-size: 11px;
          font-weight: 800;
          color: #7c6b54;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .title {
          margin: 16px 0 0;
          font-size: 38px;
          line-height: 1.05;
          font-weight: 800;
          color: #15161c;
        }
        .subtitle {
          margin: 10px auto 0;
          max-width: 720px;
          font-size: 13px;
          line-height: 1.8;
          color: #4b5563;
        }
        .recipient {
          margin-top: 26px;
          text-align: center;
          padding: 22px 28px;
          border-radius: 26px;
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 18px 40px rgba(15,23,42,0.06);
        }
        .recipient-name {
          font-size: 34px;
          font-weight: 800;
          color: #1f1728;
        }
        .recipient-copy {
          margin-top: 14px;
          font-size: 14px;
          line-height: 1.9;
          color: #374151;
        }
        .grid {
          margin-top: 22px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .card {
          border-radius: 22px;
          border: 1px solid rgba(15,23,42,0.08);
          background: rgba(255,255,255,0.82);
          padding: 16px 18px;
        }
        .card-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #7c6b54;
        }
        .card-value {
          margin-top: 8px;
          font-size: 15px;
          font-weight: 700;
          color: #111827;
        }
        .footer {
          margin-top: 24px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 210px;
          gap: 20px;
          align-items: end;
        }
        .signature-zone {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .signature-card {
          padding-top: 8px;
        }
        .signature {
          width: 180px;
          height: auto;
        }
        .sig-line {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(15,23,42,0.18);
          font-size: 12px;
          color: #4b5563;
        }
        .sig-line strong {
          display: block;
          margin-bottom: 4px;
          font-size: 13px;
          color: #111827;
        }
        .verify-box {
          padding: 16px;
          border-radius: 24px;
          border: 1px solid rgba(15,23,42,0.08);
          background: rgba(255,255,255,0.82);
          text-align: center;
        }
        .verify-box img {
          width: 104px;
          height: 104px;
        }
        .verify-title {
          margin-top: 10px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #7c6b54;
        }
        .verify-url {
          margin-top: 8px;
          font-size: 10px;
          color: #6b7280;
          line-height: 1.6;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="topbar">
          <div class="brand">
            <img src="${logoDataUri}" alt="Navyan logo" class="logo" />
            <div>
              <div class="brand-name">${escapeHtml(organizationName)}</div>
              <div class="brand-subtitle">Completion Credential</div>
            </div>
          </div>
          <div class="id-chip">${escapeHtml(certificateId)}</div>
        </div>

        <div class="title-wrap">
          <div class="eyebrow">Official completion record</div>
          <h1 class="title">Internship Completion Certificate</h1>
          <div class="subtitle">
            This certificate formally recognizes successful completion of a structured internship
            program conducted by ${escapeHtml(organizationName)}.
          </div>
        </div>

        <div class="recipient">
          <div class="recipient-name">${escapeHtml(studentName)}</div>
          <div class="recipient-copy">
            is hereby certified for successful completion of the
            <strong> ${escapeHtml(role)}</strong> internship under the
            <strong> ${escapeHtml(internshipTitle)}</strong> program. The internship duration was
            <strong> ${escapeHtml(durationLabel)}</strong>, completed on
            <strong> ${escapeHtml(completionDateStr)}</strong>, and recorded as an official outcome
            in the ${escapeHtml(organizationName)} credential registry.
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-label">Role</div>
            <div class="card-value">${escapeHtml(role)}</div>
          </div>
          <div class="card">
            <div class="card-label">Program</div>
            <div class="card-value">${escapeHtml(internshipTitle)}</div>
          </div>
          <div class="card">
            <div class="card-label">Duration</div>
            <div class="card-value">${escapeHtml(durationLabel)}</div>
          </div>
          <div class="card">
            <div class="card-label">Issue date</div>
            <div class="card-value">${escapeHtml(issueDateStr)}</div>
          </div>
        </div>

        <div class="footer">
          <div class="signature-zone">
            <div class="signature-card">
              <img src="${founderSignatureDataUri}" alt="Shivanand Kumar signature" class="signature" />
              <div class="sig-line">
                <strong>Shivanand Kumar</strong>
                Founder, ${escapeHtml(organizationName)}
              </div>
            </div>
            <div class="signature-card">
              <img src="${coFounderSignatureDataUri}" alt="Anamika Pandey signature" class="signature" />
              <div class="sig-line">
                <strong>Anamika Pandey</strong>
                Co-Founder, ${escapeHtml(organizationName)}
              </div>
            </div>
          </div>

          <div class="verify-box">
            <img src="${qrCodeDataUrl}" alt="Verification QR" />
            <div class="verify-title">Verify credential</div>
            <div class="verify-url">${escapeHtml(verifyUrl)}</div>
          </div>
        </div>
      </div>
    </body>
  </html>`;
};

export const renderCertificatePdf = async (html) => {
  return await generatePdfBufferFromHtml(html, {
    landscape: true,
    margin: {
      top: "10mm",
      right: "10mm",
      bottom: "10mm",
      left: "10mm"
    }
  });
};
