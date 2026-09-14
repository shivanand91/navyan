const key = (value) => String(value || "").trim().toLowerCase();
const unique = (...groups) => [...new Map(groups.flat().filter(Boolean).map((item) => [key(item), item])).values()];
const objectKey = (item, fields) => fields.map((field) => key(item?.[field])).join("|");
const mergeObjects = (existing = [], incoming = [], fields) => [...new Map([...existing, ...incoming].filter(Boolean).map((item) => [objectKey(item, fields), item])).values()];

export function mergeResumeProfile(existing = {}, analysis) {
  const extracted = analysis.profile || {};
  const profile = { ...existing };
  const skillFields = ["skills", "technicalSkills", "programmingLanguages", "frameworks", "databases", "cloud", "tools", "softSkills", "otherSkills"];
  skillFields.forEach((field) => { profile[field] = unique(existing[field] || [], extracted[field] || []); });
  profile.skills = unique(profile.skills, profile.technicalSkills, profile.programmingLanguages, profile.frameworks, profile.databases, profile.cloud, profile.tools);
  profile.preferredRoles = unique(existing.preferredRoles || [], [analysis.targetRole]);
  profile.careerInterests = unique(existing.careerInterests || [], analysis.eligibleFields || [], [analysis.targetRole]);
  profile.skillGaps = unique(existing.skillGaps || [], analysis.skillGaps || []);
  profile.education = mergeObjects(existing.education, extracted.education, ["degree", "institution"]);
  profile.projects = mergeObjects(existing.projects, extracted.projects, ["name"]);
  profile.experience = mergeObjects(existing.experience, extracted.experience, ["organization", "role"]);
  profile.certifications = mergeObjects(existing.certifications, extracted.certifications, ["name", "issuer"]);
  const firstEducation = extracted.education?.[0];
  if (!profile.degree && firstEducation?.degree) profile.degree = firstEducation.degree;
  if (!profile.branch && firstEducation?.field) profile.branch = firstEducation.field;
  if (!profile.college && firstEducation?.institution) profile.college = firstEducation.institution;
  if (!profile.graduationYear && firstEducation?.graduationYear) profile.graduationYear = firstEducation.graduationYear;
  return profile;
}
