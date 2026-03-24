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
    label: "Full Stack Development",
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
    label: "Mobile App Development",
    envKey: "PDF_APP_DEV",
    matchers: [
      "mobile app development",
      "mobile development",
      "mobile developer",
      "app development",
      "app dev",
      "app developer",
      "mobile app",
      "android",
      "ios",
      "flutter",
      "react native",
      "react-native"
    ]
  },
  {
    label: "Frontend Development",
    envKey: "PDF_FRONTEND",
    matchers: [
      "frontend development",
      "front end development",
      "front end",
      "frontend",
      "front-end",
      "react",
      "ui developer"
    ]
  },
  {
    label: "Backend Development",
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
    label: "Data Analytics",
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
    label: "UI/UX Design",
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
    label: "Web Development",
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

const toTitleCase = (value) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => {
      const upper = part.toUpperCase();
      if (["UI", "UX", "API", "IOS"].includes(upper)) {
        return upper;
      }

      return `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`;
    })
    .join(" ");

const cleanupFallbackDomain = (value) =>
  String(value || "")
    .replace(/\bintern(ship)?\b/gi, " ")
    .replace(/\btrainee\b/gi, " ")
    .replace(/\brole\b/gi, " ")
    .replace(/[_/-]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

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
  const match = resolveDomainMapping(internship);

  if (!match) {
    return "";
  }

  return normalizeDriveLink(process.env[match.envKey]);
};

export const resolveInternshipDomainLabel = (internship) => {
  const match = resolveDomainMapping(internship);

  if (match?.label) {
    return match.label;
  }

  const fallback =
    cleanupFallbackDomain(internship?.role) || cleanupFallbackDomain(internship?.title);

  return fallback ? toTitleCase(fallback) : "General Internship";
};

const resolveDomainMapping = (internship) => {
  const haystack = buildInternshipSearchText(internship);

  if (!haystack) {
    return null;
  }

  const match = DOMAIN_PDF_MAPPINGS
    .map((mapping) => {
      const matchedKeywords = mapping.matchers.filter((keyword) => haystack.includes(keyword));

      if (!matchedKeywords.length) {
        return null;
      }

      return {
        ...mapping,
        matchCount: matchedKeywords.length,
        longestKeywordLength: Math.max(...matchedKeywords.map((keyword) => keyword.length))
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (right.longestKeywordLength !== left.longestKeywordLength) {
        return right.longestKeywordLength - left.longestKeywordLength;
      }

      return right.matchCount - left.matchCount;
    })[0];

  return match || null;
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
