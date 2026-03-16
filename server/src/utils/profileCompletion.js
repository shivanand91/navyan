const REQUIRED_PROFILE_FIELDS = [
  "fullName",
  "email",
  "phone",
  "college",
  "degree",
  "currentYear",
  "graduationYear",
  "skills",
  "preferredRoles"
];

const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
};

export const getProfileCompletion = (profile = {}) => {
  const completedCount = REQUIRED_PROFILE_FIELDS.filter((field) =>
    hasValue(profile[field])
  ).length;

  return {
    requiredFields: REQUIRED_PROFILE_FIELDS,
    completedCount,
    totalRequired: REQUIRED_PROFILE_FIELDS.length,
    percentage: Math.round((completedCount / REQUIRED_PROFILE_FIELDS.length) * 100),
    isEligibleToApply: completedCount === REQUIRED_PROFILE_FIELDS.length
  };
};
