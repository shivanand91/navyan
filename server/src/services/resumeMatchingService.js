import rules from "../data/internshipMatchingRules.json" with { type: "json" };

const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hasTerm = (text, term) => {
  const source = normalize(text);
  const target = normalize(term);
  if (!source || !target) return false;
  return new RegExp(`(?:^|\\s)${escapeRegex(target)}(?:$|\\s)`, "i").test(source);
};
const unique = (items) => [...new Set(items.filter(Boolean))];

function splitSections(text) {
  const sections = { all: text, skills: "", projects: "", experience: "", education: "", summary: "" };
  const heading = /^(professional summary|summary|profile|technical skills|skills|core competencies|projects|work experience|experience|internships?|education|certifications?|coursework)\s*:?[ \t]*$/i;
  let current = "summary";
  for (const line of text.split(/\r?\n/)) {
    const match = line.trim().match(heading);
    if (match) {
      const label = match[1].toLowerCase();
      current = /skill|competenc/.test(label) ? "skills" : /project/.test(label) ? "projects" : /experience|internship/.test(label) ? "experience" : /education|certification|coursework/.test(label) ? "education" : "summary";
      continue;
    }
    sections[current] += `${line}\n`;
  }
  return sections;
}

function identifyName(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 5);
  for (const line of lines) {
    if (line.length > 55 || /@|https?:|\d{3,}|resume|curriculum vitae|linkedin|github|professional|summary|experience|education|skills|projects|certifications|coursework|software engineer|developer|analyst|designer|product manager|intern|consultant/i.test(line)) continue;
    const parts = line.split(/[^\p{L}'-]+/u).filter(Boolean);
    if (parts.length >= 2 && parts.length <= 4 && parts.every((part) => /^\p{Lu}\p{Ll}+(?:[-'][\p{Lu}]?\p{Ll}+)*$/u.test(part))) return parts.join(" ");
  }
  return null;
}

function extractSkills(text, sections) {
  const aliases = rules.resumeParsing.aliases || {};
  const aliasOwners = new Map();
  Object.entries(aliases).forEach(([canonical, synonyms]) => {
    synonyms.forEach((synonym) => aliasOwners.set(normalize(synonym), normalize(canonical)));
  });
  const known = new Set();
  for (const preset of rules.internshipRules) {
    [...preset.requiredSkills, ...preset.preferredSkills].forEach((skill) => known.add(normalize(skill)));
  }
  Object.entries(aliases).forEach(([canonical, synonyms]) => { known.add(normalize(canonical)); synonyms.forEach((synonym) => known.add(normalize(synonym))); });
  const evidenceText = `${sections.skills}\n${sections.projects}\n${sections.experience}\n${sections.summary}`;
  const found = [];
  for (const canonical of known) {
    if (!canonical || canonical.includes(" or ")) continue;
    const synonyms = aliases[canonical] || [];
    if (hasTerm(evidenceText, canonical) || synonyms.some((item) => hasTerm(evidenceText, item))) {
      const canonicalKey = aliasOwners.get(canonical) || canonical;
      const aliasKey = Object.keys(aliases).find((key) => normalize(key) === canonicalKey);
      found.push(aliasKey || canonicalKey);
    }
  }
  return unique(found);
}

export function normalizeResume(text, targetRole = "") {
  const sections = splitSections(text);
  return {
    studentName: identifyName(text),
    detectedSkills: extractSkills(text, sections),
    detectedProjects: sections.projects.split(/\r?\n/).map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim()).filter((line) => line.length > 8).slice(0, 12),
    detectedExperience: sections.experience.split(/\r?\n/).map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim()).filter((line) => line.length > 8).slice(0, 12),
    targetRole: String(targetRole || "").trim().slice(0, 100),
    sections
  };
}

const evidenceMatches = (evidence, text) => evidence.filter((term) => hasTerm(text, term));

export function rankInternshipPresets(resume) {
  const weights = rules.scoring.weights;
  const skillSet = resume.detectedSkills.map(normalize);
  return rules.internshipRules.map((preset) => {
    const required = preset.requiredSkills.filter((skill) => skillSet.includes(normalize(skill)) || (normalize(skill).includes(" or ") && normalize(skill).split(" or ").some((part) => skillSet.includes(part))));
    const preferred = preset.preferredSkills.filter((skill) => skillSet.includes(normalize(skill)));
    const projects = evidenceMatches(preset.projectEvidence, resume.sections.projects);
    const experience = evidenceMatches(preset.experienceEvidence, resume.sections.experience);
    const domains = evidenceMatches(preset.keywords, `${resume.sections.all}\n${resume.targetRole || ""}`);
    const learningFit = skillSet.length ? Math.min(1, (required.length + preferred.length) / Math.max(2, preset.requiredSkills.length + 2)) : 0;
    const dimensions = {
      requiredSkills: preset.requiredSkills.length ? required.length / preset.requiredSkills.length : 0,
      preferredSkills: preset.preferredSkills.length ? preferred.length / preset.preferredSkills.length : 0,
      projectEvidence: projects.length ? 1 : 0,
      experienceEvidence: experience.length ? 1 : 0,
      domainKeywords: preset.keywords.length ? domains.length / preset.keywords.length : 0,
      learningFit
    };
    const score = Math.round(Math.min(100, Object.entries(weights).reduce((sum, [key, weight]) => sum + Math.min(1, dimensions[key]) * weight * 100, 0)));
    const label = rules.scoring.labels.find((item) => score >= item.minScore && score <= item.maxScore)?.label || "Recommended starting point";
    const allRequiredAndPreferred = unique([...preset.requiredSkills, ...preset.preferredSkills]);
    const matchedSkills = allRequiredAndPreferred.filter((skill) => skillSet.includes(normalize(skill)) || (normalize(skill).includes(" or ") && normalize(skill).split(" or ").some((part) => skillSet.includes(part))));
    const missingSkills = allRequiredAndPreferred.filter((skill) => !matchedSkills.includes(skill)).slice(0, 6);
    return { preset, score, label, matchedSkills, matchedProjects: projects, matchedExperience: experience, missingSkills, portfolioProjectSuggestions: preset.portfolioProjects || [] };
  }).sort((a, b) => b.score - a.score || b.preset.fallbackPriority - a.preset.fallbackPriority);
}

export function formatRecommendation(candidate, internship, studentName) {
  const template = candidate.matchedProjects.length
    ? rules.personalizedMessages.projectMatch
    : candidate.matchedSkills.length
      ? rules.personalizedMessages.skillsWithoutProjects
      : rules.personalizedMessages.fallback;
  const greeting = studentName ? `Hi ${studentName}` : "Hi there";
  const reason = template.replaceAll("{studentGreeting}", greeting).replaceAll("{internshipTitle}", internship.title)
    .replaceAll("{matchedSkills}", candidate.matchedSkills.join(", ") || "the learning path")
    .replaceAll("{missingSkills}", candidate.missingSkills.join(", ") || "additional practical experience")
    .replace(/\{[^{}]*\}/g, "").replace(/\s{2,}/g, " ").trim();
  return {
    internshipId: internship._id,
    matchScore: candidate.score,
    matchLabel: candidate.label,
    matchedSkills: candidate.matchedSkills,
    matchedProjects: candidate.matchedProjects,
    matchedExperience: candidate.matchedExperience,
    missingSkills: candidate.missingSkills,
    reason,
    portfolioProjectSuggestions: candidate.portfolioProjectSuggestions,
    internship
  };
}

export const resumeMatchingRules = rules;
