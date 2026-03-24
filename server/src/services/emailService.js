import nodemailer from "nodemailer";

const durationLabels = {
  "4-weeks": "4 weeks",
  "3-months": "3 months",
  "6-months": "6 months"
};

const statusMeta = {
  Applied: {
    subjectPrefix: "Application received",
    title: "Your application has been received",
    summary: "We have received your application and added it to the review queue.",
    nextStep: "You do not need to submit anything else right now. We will update you after review."
  },
  "Under Review": {
    subjectPrefix: "Application under review",
    title: "Your application is under review",
    summary: "The Navyan team is reviewing your profile and motivation.",
    nextStep: "Keep an eye on your dashboard and email for the next update."
  },
  Shortlisted: {
    subjectPrefix: "You have been shortlisted",
    title: "You have been shortlisted",
    summary: "Your profile has moved into the shortlist stage.",
    nextStep: "The team may contact you or move your application into selection soon."
  },
  Selected: {
    subjectPrefix: "You have been selected",
    title: "You have been selected",
    summary: "Congratulations. Your application has been selected by the Navyan team.",
    nextStep: "Check your dashboard for your offer letter, project assignment, and timeline details."
  },
  "In Progress": {
    subjectPrefix: "Internship is in progress",
    title: "Your internship is now in progress",
    summary: "Your internship timeline has started.",
    nextStep: "Follow your project brief and dashboard progress closely."
  },
  "Submission Pending": {
    subjectPrefix: "Submission window is open",
    title: "Your submission window is now open",
    summary: "The final submission window for your internship is now available.",
    nextStep: "Open your dashboard and submit your project before the internship end date."
  },
  Submitted: {
    subjectPrefix: "Submission received",
    title: "Your project submission has been received",
    summary: "The Navyan team has your latest submission for review.",
    nextStep: "We will review it and update you if revision is required or if the internship is completed."
  },
  "Revision Requested": {
    subjectPrefix: "Revision requested",
    title: "A revision has been requested",
    summary: "Your submission needs one more revision before completion.",
    nextStep: "Open your dashboard, review the notes, and submit an updated version."
  },
  Completed: {
    subjectPrefix: "Internship completed",
    title: "Your internship is marked as completed",
    summary: "Your internship has been successfully completed.",
    nextStep: "Your certificate is now available in your dashboard."
  },
  Rejected: {
    subjectPrefix: "Application update",
    title: "Your application status has been updated",
    summary: "Your application could not be moved forward in the current cycle.",
    nextStep: "You can continue improving your profile and apply again after your current workflow is closed."
  }
};

let cachedTransporter;
let configWarningShown = false;
let deliveryWarningShown = false;
const EMAIL_RETRY_ATTEMPTS = 3;
const EMAIL_RETRY_DELAY_MS = 1200;

const parseBoolean = (value, fallback) => {
  if (typeof value !== "string") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
};

const stripTrailingSlash = (value) =>
  typeof value === "string" ? value.trim().replace(/\/$/, "") : "";

const getDashboardBaseUrl = () =>
  stripTrailingSlash(process.env.CLIENT_URL) || "http://localhost:5173";

const getDurationLabel = (internship, durationKey) => {
  const duration = internship?.durations?.find((item) => item.key === durationKey);
  return duration?.label || durationLabels[durationKey] || durationKey || "Flexible duration";
};

const getStudentName = (user) => user?.profile?.fullName || user?.fullName || "Student";

const getRecipientEmail = (user) => user?.profile?.email || user?.email || "";

const getInternshipTitle = (internship) => internship?.title || internship?.role || "Internship";

const getRoleLabel = (internship) => internship?.role || internship?.title || "Internship";

const getFromAddress = () =>
  process.env.EMAIL_FROM?.trim() || process.env.RESEND_FROM?.trim() || "";

const getReadableEmailError = (error) => {
  const smtpUser = process.env.SMTP_USER?.trim()?.toLowerCase() || "resend";

  if (error?.code === "EAUTH" && smtpUser === "resend") {
    return "Resend SMTP rejected the credentials. Set a valid RESEND_API_KEY or SMTP_PASS from the Resend dashboard and restart the server.";
  }

  if (error?.code === "EAI_AGAIN") {
    return "Temporary DNS lookup failed while contacting the mail server. Check internet or DNS and try again.";
  }

  if (error?.code === "ENOTFOUND") {
    return "Mail server hostname could not be resolved. Check internet, DNS, or SMTP host settings.";
  }

  return error?.message || "Unknown email transport error";
};

const isTransientEmailError = (error) =>
  ["EAI_AGAIN", "ENOTFOUND", "ETIMEDOUT", "ESOCKET", "ECONNECTION", "ECONNRESET"].includes(
    error?.code
  );

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withEmailRetry = async (operation) => {
  let lastError;

  for (let attempt = 1; attempt <= EMAIL_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isTransientEmailError(error) || attempt === EMAIL_RETRY_ATTEMPTS) {
        throw error;
      }

      await sleep(EMAIL_RETRY_DELAY_MS * attempt);
    }
  }

  throw lastError;
};

const getEmailConfig = () => {
  const resendApiKey = process.env.RESEND_API_KEY?.trim() || "";
  const configuredService = process.env.SMTP_SERVICE?.trim();
  const configuredHost = process.env.SMTP_HOST?.trim();
  const user =
    (resendApiKey ? "resend" : "") ||
    process.env.SMTP_USER?.trim() ||
    process.env.EMAIL_USER?.trim() ||
    "";
  const rawPass =
    resendApiKey ||
    process.env.SMTP_PASS?.trim() ||
    process.env.EMAIL_PASSWORD?.trim() ||
    "";
  const pass = rawPass;
  const isResendConfig = Boolean(resendApiKey || user === "resend");
  const service = isResendConfig ? "" : configuredService;
  const host = configuredHost || (isResendConfig ? "smtp.resend.com" : "");
  const secure = parseBoolean(process.env.SMTP_SECURE, true);
  const port = Number(process.env.SMTP_PORT || "465");

  return {
    service,
    host,
    port,
    secure,
    user,
    pass
  };
};

const getTransporter = () => {
  if (cachedTransporter !== undefined) {
    return cachedTransporter;
  }

  const { service, host, port, secure, user, pass } = getEmailConfig();

  if (!user || !pass || (!service && !host)) {
    if (!configWarningShown) {
      console.warn("Email notifications are disabled because SMTP configuration is incomplete.");
      configWarningShown = true;
    }
    cachedTransporter = null;
    return cachedTransporter;
  }

  cachedTransporter = !host && service
    ? nodemailer.createTransport({
        service,
        auth: { user, pass }
      })
    : nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
      });

  return cachedTransporter;
};

export const verifyEmailTransport = async () => {
  const transporter = getTransporter();
  const smtpUser = process.env.SMTP_USER?.trim()?.toLowerCase() || "";
  const smtpPass = process.env.SMTP_PASS?.trim() || "";
  const resendApiKey = process.env.RESEND_API_KEY?.trim() || "";
  const fromAddress = getFromAddress();

  if (!transporter) {
    return {
      ok: false,
      reason: "Resend email configuration is incomplete."
    };
  }

  if (!fromAddress) {
    return {
      ok: false,
      reason: "Set EMAIL_FROM or RESEND_FROM to a verified sender address, for example Navyan <notifications@mail.yourdomain.com>."
    };
  }

  if (!resendApiKey && (!smtpUser || !smtpPass)) {
    return {
      ok: false,
      reason: "Set RESEND_API_KEY or provide explicit SMTP_USER/SMTP_PASS credentials for Resend SMTP."
    };
  }

  try {
    await withEmailRetry(() => transporter.verify());
    return { ok: true };
  } catch (error) {
    console.error("SMTP verification failed", error);
    return {
      ok: false,
      reason: getReadableEmailError(error)
    };
  }
};

const buildEmailLayout = ({
  eyebrow,
  title,
  intro,
  summaryRows,
  nextStep,
  primaryAction,
  secondaryAction
}) => `<!doctype html>
<html>
  <body style="margin:0;background:#0b0d10;font-family:Inter,Segoe UI,Arial,sans-serif;color:#f5f7fa;">
    <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
      <div style="border:1px solid rgba(255,255,255,0.08);background:#14181d;border-radius:28px;overflow:hidden;">
        <div style="padding:28px 28px 18px;background:radial-gradient(circle at top right, rgba(212,168,95,0.16), transparent 34%), #111418;">
          <div style="display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;background:rgba(212,168,95,0.12);border:1px solid rgba(212,168,95,0.24);color:#d4a85f;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">
            ${eyebrow}
          </div>
          <h1 style="margin:18px 0 0;font-size:30px;line-height:1.1;font-weight:700;color:#f5f7fa;">${title}</h1>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.8;color:#b7c0cc;">${intro}</p>
        </div>
        <div style="padding:0 28px 28px;">
          <div style="margin-top:22px;border:1px solid rgba(255,255,255,0.08);background:#1a2027;border-radius:22px;padding:18px 18px 6px;">
            ${summaryRows
              .map(
                (row) => `
              <div style="display:flex;justify-content:space-between;gap:16px;padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="font-size:12px;text-transform:uppercase;letter-spacing:0.14em;color:#7e8794;font-weight:700;">${row.label}</span>
                <span style="font-size:14px;color:#f5f7fa;font-weight:600;text-align:right;">${row.value}</span>
              </div>
            `
              )
              .join("")}
          </div>
          <div style="margin-top:18px;border-radius:22px;background:rgba(212,168,95,0.08);border:1px solid rgba(212,168,95,0.16);padding:18px;">
            <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#d4a85f;font-weight:700;">Next step</p>
            <p style="margin:10px 0 0;font-size:14px;line-height:1.8;color:#dce2e9;">${nextStep}</p>
          </div>
          ${
            primaryAction
              ? `<div style="margin-top:22px;">
              <a href="${primaryAction.href}" style="display:inline-block;padding:13px 20px;border-radius:16px;background:#d4a85f;color:#111418;font-size:14px;font-weight:700;text-decoration:none;">
                ${primaryAction.label}
              </a>
            </div>`
              : ""
          }
          ${
            secondaryAction
              ? `<div style="margin-top:12px;">
              <a href="${secondaryAction.href}" style="display:inline-block;padding:12px 18px;border-radius:16px;border:1px solid rgba(255,255,255,0.1);background:#1a2027;color:#f5f7fa;font-size:14px;font-weight:600;text-decoration:none;">
                ${secondaryAction.label}
              </a>
            </div>`
              : ""
          }
          <p style="margin:24px 0 0;font-size:12px;line-height:1.8;color:#7e8794;">
            This is an automated update from Navyan. Please use your dashboard for the latest status and documents.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`;

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  const from = getFromAddress();

  if (!transporter || !from || !to) {
    if (!deliveryWarningShown) {
      console.warn("Email delivery skipped because sender, recipient, or SMTP transport is unavailable.");
      deliveryWarningShown = true;
    }
    return false;
  }

  try {
    const info = await withEmailRetry(() =>
      transporter.sendMail({
        from,
        to,
        subject,
        html,
        text
      })
    );
    if (process.env.NODE_ENV !== "production") {
      console.log(`Email sent to ${to}: ${subject} (${info.messageId || "no-message-id"})`);
    }
    return true;
  } catch (error) {
    console.error("Failed to send email notification", getReadableEmailError(error));
    return false;
  }
};

export const sendApplicationReceivedEmail = async ({ user, internship, durationKey }) => {
  const studentName = getStudentName(user);
  const internshipTitle = getInternshipTitle(internship);
  const roleLabel = getRoleLabel(internship);
  const durationLabel = getDurationLabel(internship, durationKey);
  const dashboardUrl = `${getDashboardBaseUrl()}/student/applications`;

  return sendEmail({
    to: getRecipientEmail(user),
    subject: `Navyan: We are reviewing your application for ${internshipTitle}`,
    text: `Hello ${studentName}, thank you for applying to Navyan. We have received your application for ${internshipTitle} (${durationLabel}) and our team is reviewing it. We will update you soon. Track it here: ${dashboardUrl}`,
    html: buildEmailLayout({
      eyebrow: "Application under review",
      title: `Thank you for applying to Navyan`,
      intro: `Hello ${studentName}, we have received your application for ${internshipTitle}. Our team is reviewing your profile and we will share the next update soon.`,
      summaryRows: [
        { label: "Internship", value: internshipTitle },
        { label: "Role", value: roleLabel },
        { label: "Duration", value: durationLabel },
        { label: "Current status", value: "Under Review" }
      ],
      nextStep: "Thank you for applying to Navyan. We are reviewing your application and will update you as soon as there is progress.",
      primaryAction: {
        href: dashboardUrl,
        label: "Open application dashboard"
      }
    })
  });
};

export const sendApplicationStatusEmail = async ({
  user,
  internship,
  durationKey,
  status,
  previousStatus,
  offerLetterUrl,
  taskPdfUrl,
  certificateUrl
}) => {
  const recipient = getRecipientEmail(user);
  if (!recipient || !status || status === previousStatus) {
    return false;
  }

  const studentName = getStudentName(user);
  const internshipTitle = getInternshipTitle(internship);
  const roleLabel = getRoleLabel(internship);
  const durationLabel = getDurationLabel(internship, durationKey);
  const meta = statusMeta[status] || statusMeta.Applied;
  const dashboardUrl = `${getDashboardBaseUrl()}/student/applications`;

  let action = {
    href: dashboardUrl,
    label: "Open dashboard"
  };
  let secondaryAction = null;

  if (status === "Selected") {
    if (offerLetterUrl) {
      action = {
        href: offerLetterUrl,
        label: "View offer letter"
      };
    }

    if (taskPdfUrl) {
      secondaryAction = offerLetterUrl
        ? {
            href: taskPdfUrl,
            label: "Open task brief"
          }
        : {
            href: taskPdfUrl,
            label: "Open task brief"
          };

      if (!offerLetterUrl) {
        action = secondaryAction;
        secondaryAction = null;
      }
    }
  }

  if (status === "Completed" && certificateUrl) {
    action = {
      href: certificateUrl,
      label: "View certificate"
    };
  }

  return sendEmail({
    to: recipient,
    subject: `Navyan: ${meta.subjectPrefix} for ${internshipTitle}`,
    text: `Hello ${studentName}, your application for ${internshipTitle} moved from ${previousStatus || "Applied"} to ${status}. Open your dashboard for the latest details: ${dashboardUrl}`,
    html: buildEmailLayout({
      eyebrow: `Status: ${status}`,
      title: meta.title,
      intro: `Hello ${studentName}, ${meta.summary}`,
      summaryRows: [
        { label: "Internship", value: internshipTitle },
        { label: "Role", value: roleLabel },
        { label: "Duration", value: durationLabel },
        { label: "Previous status", value: previousStatus || "Applied" },
        { label: "Current status", value: status }
      ],
      nextStep: meta.nextStep,
      primaryAction: action,
      secondaryAction
    })
  });
};
