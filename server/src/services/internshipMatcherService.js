const words = (value) => new Set(String(value || "").toLowerCase().match(/[a-z0-9+#.]{2,}/g) || []);
const overlap = (a, b) => { const left = words(a); const right = words(b); return [...left].filter((word) => right.has(word)).length; };

export function matchInternships(internships, analysis, profile) {
  const candidateSkills = [...(profile.skills || []), ...(profile.technicalSkills || [])].join(" ");
  return internships.map((internship) => {
    const roleScore = overlap(`${internship.title} ${internship.role}`, `${analysis.targetRole} ${(analysis.eligibleFields || []).join(" ")}`) * 13;
    const required = internship.skillsRequired || [];
    const skillScore = required.length ? (required.filter((skill) => overlap(skill, candidateSkills) > 0).length / required.length) * 55 : 25;
    const experienceScore = analysis.candidateLevel === "Advanced" ? 15 : analysis.candidateLevel === "Intermediate" ? 10 : 6;
    const matchPercentage = Math.max(12, Math.min(99, Math.round(roleScore + skillScore + experienceScore + 10)));
    const matchedSkills = required.filter((skill) => overlap(skill, candidateSkills) > 0).slice(0, 3);
    const missing = required.filter((skill) => !matchedSkills.includes(skill)).slice(0, 1);
    return { internshipId: internship._id, title: internship.title, slug: internship.slug, mode: internship.mode, matchPercentage, matchedSkills, requirement: missing[0] || "Practical project experience", reason: matchedSkills.length ? `Matches your ${matchedSkills.join(" and ")} background and can help you build more practical experience.` : `A suitable next step to build practical experience for ${analysis.targetRole}.` };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 3);
}
