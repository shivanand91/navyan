import { User } from "../models/User.js";
import { Internship } from "../models/Internship.js";
import { extractResumeText } from "../services/resumeParserService.js";
import { analyzeResume } from "../services/aiProviderService.js";
import { mergeResumeProfile } from "../services/resumeProfileService.js";
import { matchInternships } from "../services/internshipMatcherService.js";
import { formatRecommendation, normalizeResume, rankInternshipPresets, resumeMatchingRules } from "../services/resumeMatchingService.js";

export async function recommendResumeController(req, res, next) {
  const buffer = req.file?.buffer;
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Please upload a PDF or DOCX resume." });
    const targetRole = String(req.body?.targetRole || "").trim();
    if (targetRole.length > 100) return res.status(400).json({ success: false, message: "Target role must be 100 characters or fewer." });
    const text = await extractResumeText(req.file);
    const resume = normalizeResume(text, targetRole);
    if (!resume.detectedSkills.length && !resume.detectedProjects.length && !resume.detectedExperience.length && text.length < 100) {
      return res.status(422).json({ success: false, message: "We couldn't identify enough readable resume content. Upload a clearer file or paste your resume text." });
    }
    const ranked = rankInternshipPresets(resume);
    const bySlug = new Map(resumeMatchingRules.databaseMapping.presetToDatabase.map(({ presetId, slug }) => [presetId, slug]));
    const rankedSlugs = ranked.map(({ preset }) => bySlug.get(preset.presetId)).filter(Boolean);
    const records = await Internship.find({ slug: { $in: rankedSlugs }, isPublished: true, isDeleted: { $ne: true } })
      .select("title slug coverImageUrl shortDescription description role mode skillsRequired durations")
      .lean();
    const recordsBySlug = new Map(records.map((item) => [item.slug, item]));
    const recommendations = ranked.map((candidate) => {
      const internship = recordsBySlug.get(bySlug.get(candidate.preset.presetId));
      return internship ? formatRecommendation(candidate, internship, resume.studentName) : null;
    }).filter(Boolean).slice(0, resumeMatchingRules.engine.maximumRecommendations);
    const top = recommendations[0];
    const personalizedMessage = top?.reason || resumeMatchingRules.fallbackPolicy.noPublishedDatabaseRecords.message;
    return res.json({ success: true, analysisMethod: "rule_based", studentName: resume.studentName, personalizedMessage, notice: resumeMatchingRules.personalizedMessages.notice, detectedSkills: resume.detectedSkills, detectedProjects: resume.detectedProjects, detectedExperience: resume.detectedExperience, recommendations });
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 422) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  } finally {
    if (buffer) buffer.fill(0);
    if (req.file) req.file.buffer = undefined;
  }
}

export async function analyzeResumeController(req, res, next) {
  let buffer = req.file?.buffer;
  try {
    const targetRole = String(req.body?.targetRole || "").trim();
    if (!req.file) return res.status(400).json({ message: "Please upload a PDF or DOCX resume." });
    if (!targetRole || targetRole.length > 100) return res.status(400).json({ message: "Please enter a valid target role." });
    const text = await extractResumeText(req.file);
    const analysis = await analyzeResume({ targetRole, resumeText: text });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });
    const merged = mergeResumeProfile(user.profile?.toObject?.() || {}, analysis);
    const internships = await Internship.find({ isPublished: true, isDeleted: { $ne: true } }).select("title slug role mode skillsRequired").lean();
    const recommendations = matchInternships(internships, analysis, merged);
    merged.analysisHistory = [...(merged.analysisHistory || []), { targetRole: analysis.targetRole, overallMatch: analysis.overallMatch, analyzedAt: new Date(), skillGaps: analysis.skillGaps, recommendedInternshipIds: recommendations.map((item) => item.internshipId) }].slice(-10);
    user.profile = merged;
    await user.save();
    res.json({ success: true, profileUpdated: true, analysis, recommendations });
  } catch (error) { next(error); } finally { if (buffer) buffer.fill(0); buffer = null; if (req.file) req.file.buffer = undefined; }
}
