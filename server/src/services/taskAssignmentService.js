const DRIVE_FILE_PATTERN = /drive\.google\.com\/file\/d\/([^/]+)/i;

export const TASK_ASSIGNED_STATUSES = [
  "Selected",
  "In Progress",
  "Submission Pending",
  "Submitted",
  "Revision Requested",
  "Completed"
];

const DOMAIN_PDF_MAPPINGS = [
  {
    envKey: "PDF_FULLSTACK",
    matchers: [
      "full stack",
      "fullstack",
      "mern",
      "mean stack",
      "full-stack"
    ]
  },
  {
    envKey: "PDF_FRONTEND",
    matchers: [
      "front end",
      "frontend",
      "front-end",
      "react",
      "ui developer"
    ]
  },
  {
    envKey: "PDF_BACKEND",
    matchers: [
      "back end",
      "backend",
      "back-end",
      "node",
      "api development",
      "server-side"
    ]
  },
  {
    envKey: "PDF_APP_DEV",
    matchers: [
      "app development",
      "app dev",
      "mobile app",
      "android",
      "ios",
      "flutter",
      "react native"
    ]
  },
  {
    envKey: "PDF_DATA_ANALYTICS",
    matchers: [
      "data analytics",
      "data analyst",
      "analytics",
      "data analysis",
      "power bi",
      "excel"
    ]
  },
  {
    envKey: "PDF_UI_UX",
    matchers: [
      "ui ux",
      "ui/ux",
      "ux ui",
      "product design",
      "figma",
      "designer"
    ]
  },
  {
    envKey: "PDF_WEB_DEV",
    matchers: [
      "web development",
      "web dev",
      "website development",
      "website developer",
      "web developer"
    ]
  }
];

const normalizeDriveLink = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }

  const match = trimmed.match(DRIVE_FILE_PATTERN);
  if (!match?.[1]) {
    return trimmed;
  }

  return `https://drive.google.com/file/d/${match[1]}/view`;
};

const buildInternshipSearchText = (internship) =>
  [
    internship?.role,
    internship?.title,
    internship?.slug,
    internship?.shortDescription,
    internship?.description,
    ...(internship?.skillsRequired || [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export const resolveDomainTaskPdfUrl = (internship) => {
  const haystack = buildInternshipSearchText(internship);

  if (!haystack) {
    return "";
  }

  const match = DOMAIN_PDF_MAPPINGS.find(({ matchers }) =>
    matchers.some((keyword) => haystack.includes(keyword))
  );

  if (!match) {
    return "";
  }

  return normalizeDriveLink(process.env[match.envKey]);
};

export const resolveAssignedTaskPdfUrl = ({
  internship,
  durationKey,
  existingTaskPdfUrl
}) => {
  const durationOption = internship?.durations?.find((item) => item.key === durationKey);

  return normalizeDriveLink(
    durationOption?.taskPdfUrl || existingTaskPdfUrl || resolveDomainTaskPdfUrl(internship)
  );
};

export const shouldExposeAssignedTask = (application) =>
  TASK_ASSIGNED_STATUSES.includes(application?.status);
