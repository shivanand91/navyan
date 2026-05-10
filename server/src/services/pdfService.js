import { extname } from "path";
import { readFile } from "fs/promises";
import { generatePdfBufferFromHtml } from "../utils/pdf.js";

let cachedFullLogoDataUri = null;
let cachedHalfLogoDataUri = null;

const createSvgDataUri = (markup) =>
  `data:image/svg+xml;base64,${Buffer.from(markup).toString("base64")}`;

const fallbackFullLogoDataUri = createSvgDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="620" height="190" viewBox="0 0 620 190">
    <rect width="620" height="190" fill="white"/>
    <path d="M50 134V58l70 76V58" fill="none" stroke="#1368e8" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="144" cy="58" r="14" fill="#f5a400"/>
    <text x="190" y="118" fill="#061432" font-family="Arial, sans-serif" font-size="78" font-weight="800">Navyan</text>
    <path d="M192 146h82M438 146h82" stroke="#c98210" stroke-width="3"/>
    <text x="286" y="153" fill="#061432" font-family="Arial, sans-serif" font-size="20">Internships and IT Services</text>
  </svg>
`);

const fallbackHalfLogoDataUri = createSvgDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
    <circle cx="110" cy="110" r="102" fill="#fff" stroke="#061432" stroke-width="8"/>
    <circle cx="110" cy="110" r="84" fill="none" stroke="#c98210" stroke-width="4"/>
    <path d="M72 145V75l62 70V75" fill="none" stroke="#1368e8" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="150" cy="74" r="12" fill="#f5a400"/>
    <text x="110" y="36" text-anchor="middle" fill="#061432" font-family="Arial, sans-serif" font-size="20" font-weight="800">NAVYAN</text>
  </svg>
`);

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const normalizeCandidate = (candidate) => {
  if (!candidate) return null;
  if (candidate instanceof URL) return candidate;
  return String(candidate).trim() || null;
};

const getMimeType = (candidate) => {
  const extension = extname(candidate instanceof URL ? candidate.pathname : String(candidate)).toLowerCase();

  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".svg") return "image/svg+xml";
  return "application/octet-stream";
};

const readAssetAsDataUri = async (candidate) => {
  const normalized = normalizeCandidate(candidate);
  if (!normalized) return "";

  const buffer = await readFile(normalized);
  return `data:${getMimeType(normalized)};base64,${buffer.toString("base64")}`;
};

const getFullLogoDataUri = async () => {
  if (cachedFullLogoDataUri) return cachedFullLogoDataUri;

  const remoteLogoUrl = process.env.DOCUMENT_LOGO_URL?.trim();
  if (remoteLogoUrl) {
    cachedFullLogoDataUri = remoteLogoUrl;
    return cachedFullLogoDataUri;
  }

  const candidates = [
    process.env.DOCUMENT_FULL_LOGO_PATH,
    process.env.DOCUMENT_LOGO_PATH,
    new URL("../../../client/src/assests/full_logo.png", import.meta.url),
    new URL("../../../client/src/assests/Navyan.svg", import.meta.url)
  ];

  for (const candidate of candidates) {
    try {
      cachedFullLogoDataUri = await readAssetAsDataUri(candidate);
      return cachedFullLogoDataUri;
    } catch {
      // Keep trying known local asset locations.
    }
  }

  cachedFullLogoDataUri = fallbackFullLogoDataUri;
  return cachedFullLogoDataUri;
};

const getHalfLogoDataUri = async () => {
  if (cachedHalfLogoDataUri) return cachedHalfLogoDataUri;

  const remoteLogoUrl = process.env.DOCUMENT_HALF_LOGO_URL?.trim();
  if (remoteLogoUrl) {
    cachedHalfLogoDataUri = remoteLogoUrl;
    return cachedHalfLogoDataUri;
  }

  const candidates = [
    process.env.DOCUMENT_HALF_LOGO_PATH,
    new URL("../../../client/src/assests/half_logo.png", import.meta.url),
    new URL("../../../client/src/assests/full_logo.png", import.meta.url)
  ];

  for (const candidate of candidates) {
    try {
      cachedHalfLogoDataUri = await readAssetAsDataUri(candidate);
      return cachedHalfLogoDataUri;
    } catch {
      // Keep trying known local asset locations.
    }
  }

  cachedHalfLogoDataUri = fallbackHalfLogoDataUri;
  return cachedHalfLogoDataUri;
};

const getSignatureDataUri = (name, text, tone = "#061432") =>
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="430" height="120" viewBox="0 0 430 120">
      <path d="M28 92 C95 80, 164 78, 244 79 C302 79, 356 76, 402 67" fill="none" stroke="#061432" stroke-width="3" stroke-linecap="round"/>
      <text
        x="34"
        y="76"
        fill="${tone}"
        font-family="'Brush Script MT', 'Segoe Script', 'Lucida Handwriting', cursive"
        font-size="46"
        font-weight="500"
        letter-spacing="0"
      >${escapeHtml(text || name)}</text>
    </svg>
  `);

const founderSignatureDataUri = getSignatureDataUri("Shivanand Kumar", "Shivanand", "#071533");
const coFounderSignatureDataUri = getSignatureDataUri("Anamika Pandey", "Anamika", "#071533");

const formatMode = (mode) => {
  const normalized = String(mode || "Remote").trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const createCornerStyles = () => `
  .corner-top {
    position: absolute;
    left: 0;
    top: 0;
    width: 360px;
    height: 290px;
    background: linear-gradient(135deg, #041328 0%, #08264a 60%, transparent 61%);
    clip-path: polygon(0 0, 100% 0, 0 100%);
  }
  .corner-top::after {
    content: "";
    position: absolute;
    left: -10px;
    top: 78px;
    width: 460px;
    height: 58px;
    background: linear-gradient(90deg, #b97712, #f1c45a, #b97712);
    transform: rotate(-32deg);
    transform-origin: left top;
  }
  .corner-bottom {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 340px;
    height: 260px;
    background: linear-gradient(315deg, #041328 0%, #08264a 62%, transparent 63%);
    clip-path: polygon(100% 0, 100% 100%, 0 100%);
  }
  .corner-bottom::before {
    content: "";
    position: absolute;
    right: -60px;
    bottom: 86px;
    width: 470px;
    height: 52px;
    background: linear-gradient(90deg, #b97712, #f1c45a, #b97712);
    transform: rotate(-31deg);
    transform-origin: right bottom;
  }
  .subtle-lines {
    position: absolute;
    inset: 0;
    opacity: 0.2;
    background-image:
      repeating-radial-gradient(ellipse at center, rgba(6,20,50,0.15) 0 1px, transparent 1px 9px);
    mask-image: linear-gradient(90deg, transparent, black 15%, black 85%, transparent);
  }
`;

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
  const fullLogoDataUri = await getFullLogoDataUri();
  const halfLogoDataUri = await getHalfLogoDataUri();
  const resolvedRole = role || internshipTitle;

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
          color: #080d1c;
          background: #ffffff;
        }
        .page {
          position: relative;
          width: 210mm;
          height: 297mm;
          overflow: hidden;
          background: #fff;
          padding: 30px 46px 48px;
        }
        .page::before {
          content: "";
          position: absolute;
          inset: 0;
          border: 1px solid #d4a040;
          pointer-events: none;
        }
        .top-corner {
          position: absolute;
          right: 0;
          top: 0;
          width: 134px;
          height: 118px;
          background: linear-gradient(225deg, #061432 0 50%, transparent 51%);
        }
        .top-corner::after {
          content: "";
          position: absolute;
          right: 12px;
          top: 2px;
          width: 32px;
          height: 158px;
          background: linear-gradient(#f2c052, #b97812);
          transform: rotate(-35deg);
        }
        .bottom-band {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 48px;
          background: #061432;
          color: #fff;
        }
        .bottom-band::before,
        .bottom-band::after {
          content: "";
          position: absolute;
          bottom: 0;
          width: 120px;
          height: 48px;
          background: linear-gradient(135deg, #f2c052, #b97812);
        }
        .bottom-band::before { left: 0; clip-path: polygon(0 0, 100% 100%, 0 100%); }
        .bottom-band::after { right: 0; clip-path: polygon(100% 0, 100% 100%, 0 100%); }
        .footer-contact {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 34px;
          height: 100%;
          font-size: 11px;
          letter-spacing: 0;
        }
        .footer-contact span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #fff;
        }
        .header {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 250px;
          gap: 34px;
          align-items: start;
        }
        .logo {
          width: 286px;
          height: auto;
          display: block;
        }
        .contact-card {
          border-left: 2px solid #c47a10;
          padding-left: 18px;
          margin-top: 8px;
        }
        .contact-card h2 {
          margin: 0;
          font-size: 15px;
          letter-spacing: 0.03em;
          color: #071533;
        }
        .contact-card p {
          margin: 5px 0;
          font-size: 12px;
          color: #111827;
        }
        .ref-row {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-top: 52px;
          padding-bottom: 6px;
          border-bottom: 1.5px solid #c98518;
          font-size: 13px;
        }
        .letter-title {
          position: relative;
          z-index: 1;
          margin: 24px 0 26px;
          text-align: center;
        }
        .letter-title h1 {
          margin: 0;
          color: #071533;
          font-size: 31px;
          line-height: 1;
          letter-spacing: 0.03em;
          font-weight: 800;
        }
        .ornament {
          width: 145px;
          height: 1px;
          margin: 14px auto 0;
          background: #c98518;
          position: relative;
        }
        .ornament::after {
          content: "";
          position: absolute;
          left: 50%;
          top: -5px;
          width: 10px;
          height: 10px;
          border: 1px solid #c98518;
          transform: translateX(-50%) rotate(45deg);
          background: #fff;
        }
        .content {
          position: relative;
          z-index: 1;
          font-size: 13.4px;
          line-height: 1.48;
        }
        .content p {
          margin: 0 0 14px;
        }
        .content strong,
        .blue {
          color: #071b55;
          font-weight: 800;
        }
        .section {
          margin-top: 17px;
        }
        .section-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          color: #bd7209;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .icon-box {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          background: #bd7209;
          display: inline-block;
          position: relative;
        }
        .details {
          margin-left: 32px;
          display: grid;
          grid-template-columns: 142px 1fr;
          gap: 5px 10px;
          font-size: 13px;
        }
        .details div:nth-child(odd) {
          font-weight: 800;
        }
        ul,
        ol {
          margin: 0 0 0 36px;
          padding-left: 16px;
        }
        li {
          margin: 4px 0;
        }
        .closing {
          margin-top: 20px;
        }
        .signature-row {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 132px 1fr;
          gap: 30px;
          align-items: end;
          margin-top: 24px;
        }
        .signature-card {
          text-align: center;
        }
        .signature {
          width: 155px;
          height: 50px;
          object-fit: contain;
        }
        .sig-line {
          width: 180px;
          margin: 0 auto;
          border-top: 1.5px solid #c98518;
          padding-top: 8px;
          color: #071b55;
          font-size: 13px;
          font-weight: 800;
        }
        .sig-line span {
          display: block;
          margin-top: 4px;
          color: #111827;
          font-size: 11px;
          font-weight: 500;
        }
        .seal {
          width: 120px;
          height: 120px;
          margin: 0 auto;
          border-radius: 50%;
          border: 3px solid #071b55;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          box-shadow: inset 0 0 0 5px #fff, inset 0 0 0 7px #d5a03a;
        }
        .seal img {
          width: 72px;
          height: 86px;
          object-fit: contain;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="top-corner"></div>
        <div class="bottom-band">
          <div class="footer-contact">
            <span>www.navyan.online</span>
            <span>|</span>
            <span>contact@navyan.online</span>
            <span>|</span>
            <span>India</span>
          </div>
        </div>

        <div class="header">
          <img src="${fullLogoDataUri}" alt="Navyan logo" class="logo" />
          <div class="contact-card">
            <h2>NAVYAN</h2>
            <p>Internships and IT Services</p>
            <p>www.navyan.online</p>
            <p>contact@navyan.online</p>
            <p>India</p>
          </div>
        </div>

        <div class="ref-row">
          <div>Ref. No.: ${escapeHtml(offerId)}</div>
          <div>Date: ${escapeHtml(issueDateStr)}</div>
        </div>

        <div class="letter-title">
          <h1>OFFER LETTER</h1>
          <div class="ornament"></div>
        </div>

        <div class="content">
          <p><strong>Dear ${escapeHtml(studentName)},</strong></p>
          <p><strong>Congratulations!</strong></p>
          <p>
            We are pleased to offer you the position of
            <span class="blue">${escapeHtml(resolvedRole)}</span> at
            <span class="blue">${escapeHtml(organizationName)} (Internships and IT Services)</span>.
            We were impressed with your skills, passion, and enthusiasm, and we believe you will be
            a great addition to our team.
          </p>

          <div class="section">
            <div class="section-heading"><span class="icon-box"></span> Internship Details</div>
            <div class="details">
              <div>Position</div><div>: ${escapeHtml(resolvedRole)}</div>
              <div>Department</div><div>: ${escapeHtml(internshipTitle || "Development")}</div>
              <div>Internship Duration</div><div>: ${escapeHtml(durationLabel)}</div>
              <div>Start Date</div><div>: ${escapeHtml(startDateStr)}</div>
              <div>End Date</div><div>: ${escapeHtml(endDateStr)}</div>
              <div>Stipend</div><div>: ${escapeHtml(internshipType || "As applicable")}</div>
              <div>Work Mode</div><div>: ${escapeHtml(formatMode(mode))}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-heading"><span class="icon-box"></span> Role & Responsibilities</div>
            <ul>
              <li>Work on assigned tasks and projects as per the guidance of the project coordinator.</li>
              <li>Collaborate with the team to deliver high-quality results.</li>
              <li>Learn, implement, and contribute innovative ideas.</li>
              <li>Maintain professionalism, discipline, and commitment throughout the internship.</li>
            </ul>
          </div>

          <div class="section">
            <div class="section-heading"><span class="icon-box"></span> Terms & Conditions</div>
            <ol>
              <li>This internship is purely for educational and skill development purposes.</li>
              <li>You are expected to maintain confidentiality of all company information.</li>
              <li>Any misconduct or failure to meet expectations may result in termination of the internship.</li>
              <li>Upon successful completion, you will be awarded a Certificate of Internship.</li>
            </ol>
          </div>

          <p class="closing">
            We are excited to have you on board and look forward to a productive and rewarding
            journey together.<br />Welcome to the <span class="blue">${escapeHtml(organizationName)}</span> family!
          </p>
          <p><strong>Best Regards,</strong></p>
        </div>

        <div class="signature-row">
          <div class="signature-card">
            <img src="${founderSignatureDataUri}" alt="Shivanand Kumar signature" class="signature" />
            <div class="sig-line">Shivanand Kumar<span>Founder<br />${escapeHtml(organizationName)}</span></div>
          </div>
          <div class="seal"><img src="${halfLogoDataUri}" alt="Navyan seal" /></div>
          <div class="signature-card">
            <img src="${coFounderSignatureDataUri}" alt="Anamika Pandey signature" class="signature" />
            <div class="sig-line">Anamika Pandey<span>Co-Founder<br />${escapeHtml(organizationName)}</span></div>
          </div>
        </div>
      </div>
    </body>
  </html>`;
};

export const renderOfferLetterPdf = async (html) => {
  return await generatePdfBufferFromHtml(html, {
    margin: {
      top: "0",
      right: "0",
      bottom: "0",
      left: "0"
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
  const fullLogoDataUri = await getFullLogoDataUri();
  const halfLogoDataUri = await getHalfLogoDataUri();
  const resolvedRole = role || internshipTitle || "Internship";

  return `<!doctype html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        @page { size: A4 landscape; margin: 0; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
          color: #061432;
          background: #fff;
        }
        .page {
          position: relative;
          width: 297mm;
          height: 210mm;
          overflow: hidden;
          background: #fffdf9;
          padding: 18px 44px 26px;
          text-align: center;
        }
        .page::before {
          content: "";
          position: absolute;
          inset: 13px;
          border: 2px solid #c88414;
          pointer-events: none;
        }
        ${createCornerStyles()}
        .watermark {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 310px;
          height: 360px;
          object-fit: contain;
          transform: translate(-50%, -37%);
          opacity: 0.035;
        }
        .logo {
          position: relative;
          z-index: 1;
          width: 345px;
          height: auto;
          margin: 14px auto 0;
          display: block;
        }
        .title {
          position: relative;
          z-index: 1;
          margin-top: 22px;
        }
        .title h1 {
          margin: 0;
          color: #061432;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 58px;
          line-height: 0.95;
          font-weight: 500;
          letter-spacing: 0.23em;
          text-shadow: 0 1px 0 rgba(6,20,50,0.15);
        }
        .title h2 {
          display: inline-flex;
          align-items: center;
          gap: 22px;
          margin: 14px 0 0;
          color: #8e570b;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 30px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.32em;
        }
        .title h2::before,
        .title h2::after {
          content: "";
          width: 90px;
          height: 1.5px;
          background: #c88414;
        }
        .presented {
          position: relative;
          z-index: 1;
          margin-top: 28px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          letter-spacing: 0.26em;
          color: #111827;
        }
        .student-name {
          position: relative;
          z-index: 1;
          display: inline-block;
          margin-top: 16px;
          min-width: 520px;
          padding: 0 28px 11px;
          border-bottom: 2px solid #c88414;
          color: #061432;
          font-family: "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive;
          font-size: 66px;
          line-height: 0.9;
          font-weight: 500;
        }
        .certificate-copy {
          position: relative;
          z-index: 1;
          max-width: 650px;
          margin: 18px auto 0;
          color: #161b28;
          font-size: 15.8px;
          line-height: 1.48;
        }
        .certificate-copy strong {
          color: #061432;
        }
        .badge {
          position: absolute;
          z-index: 2;
          right: 86px;
          top: 135px;
          width: 154px;
          height: 154px;
          border-radius: 50%;
          background:
            radial-gradient(circle at 50% 50%, #08214a 0 52%, transparent 53%),
            conic-gradient(from 0deg, #a15f09, #f4cc68, #9e5b08, #f4cc68, #a15f09);
          box-shadow: 0 16px 26px rgba(45,28,5,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          font-weight: 800;
          line-height: 1.35;
          text-transform: uppercase;
        }
        .badge::before,
        .badge::after {
          content: "";
          position: absolute;
          bottom: -54px;
          width: 35px;
          height: 75px;
          background: linear-gradient(#dba943, #b46b10);
          z-index: -1;
        }
        .badge::before {
          left: 38px;
          transform: rotate(14deg);
          clip-path: polygon(0 0, 100% 0, 82% 100%, 46% 76%, 0 100%);
        }
        .badge::after {
          right: 38px;
          transform: rotate(-14deg);
          clip-path: polygon(0 0, 100% 0, 100% 100%, 54% 76%, 18% 100%);
        }
        .footer-area {
          position: absolute;
          z-index: 2;
          left: 190px;
          right: 190px;
          bottom: 56px;
          display: grid;
          grid-template-columns: 1fr 140px 1fr;
          gap: 48px;
          align-items: end;
        }
        .signature-card {
          text-align: center;
        }
        .signature {
          width: 152px;
          height: 54px;
          object-fit: contain;
        }
        .sig-line {
          width: 190px;
          margin: 0 auto;
          border-top: 1.6px solid #c88414;
          padding-top: 8px;
          color: #071b55;
          font-size: 14px;
          font-weight: 800;
        }
        .sig-line span {
          display: block;
          margin-top: 5px;
          color: #8e570b;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .center-seal {
          width: 118px;
          height: 118px;
          margin: 0 auto;
          border-radius: 50%;
          border: 3px solid #071b55;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 0 5px #fff, inset 0 0 0 7px #c88414;
        }
        .center-seal img {
          width: 70px;
          height: 86px;
          object-fit: contain;
        }
        .verify {
          position: absolute;
          z-index: 3;
          left: 42px;
          bottom: 34px;
          width: 88px;
          text-align: center;
          font-size: 6.6px;
          color: #061432;
          line-height: 1.25;
          word-break: break-all;
        }
        .verify img {
          width: 58px;
          height: 58px;
          display: block;
          margin: 0 auto 3px;
        }
        .cert-id {
          position: absolute;
          z-index: 2;
          right: 42px;
          bottom: 34px;
          color: #061432;
          font-size: 9px;
          text-align: right;
        }
        .motto {
          position: absolute;
          z-index: 2;
          left: 0;
          right: 0;
          bottom: 25px;
          color: #161b28;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 15px;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="subtle-lines"></div>
        <div class="corner-top"></div>
        <div class="corner-bottom"></div>
        <img src="${halfLogoDataUri}" alt="Navyan watermark" class="watermark" />
        <img src="${fullLogoDataUri}" alt="Navyan logo" class="logo" />

        <div class="badge">Learn<br />Perform<br />Grow</div>

        <div class="title">
          <h1>CERTIFICATE</h1>
          <h2>OF INTERNSHIP</h2>
        </div>

        <div class="presented">THIS CERTIFICATE IS PROUDLY PRESENTED TO</div>
        <div class="student-name">${escapeHtml(studentName)}</div>

        <div class="certificate-copy">
          For successfully completing the <strong>${escapeHtml(resolvedRole)}</strong> internship
          program at ${escapeHtml(organizationName)}. During this internship, the individual has
          shown dedication, consistency, and a strong willingness to learn and contribute.
          We appreciate their efforts and wish them success in their future endeavors.
        </div>

        <div class="footer-area">
          <div class="signature-card">
            <img src="${founderSignatureDataUri}" alt="Shivanand Kumar signature" class="signature" />
            <div class="sig-line">Shivanand Kumar<span>Founder</span></div>
          </div>
          <div class="center-seal"><img src="${halfLogoDataUri}" alt="Navyan seal" /></div>
          <div class="signature-card">
            <img src="${coFounderSignatureDataUri}" alt="Anamika Pandey signature" class="signature" />
            <div class="sig-line">Anamika Pandey<span>Co-Founder</span></div>
          </div>
        </div>

        <div class="verify">
          <img src="${qrCodeDataUrl}" alt="Verification QR" />
          ${escapeHtml(verifyUrl)}
        </div>
        <div class="cert-id">
          Certificate ID: ${escapeHtml(certificateId)}<br />
          Completed: ${escapeHtml(completionDateStr)}<br />
          Issued: ${escapeHtml(issueDateStr)}
        </div>
        <div class="motto">"Learn, Perform, Grow"</div>
      </div>
    </body>
  </html>`;
};

export const renderCertificatePdf = async (html) => {
  return await generatePdfBufferFromHtml(html, {
    landscape: true,
    margin: {
      top: "0",
      right: "0",
      bottom: "0",
      left: "0"
    }
  });
};
