import { User } from "../models/User.js";
import { Internship } from "../models/Internship.js";
import { extractResumeText } from "../services/resumeParserService.js";
import { analyzeResume } from "../services/aiProviderService.js";
import { mergeResumeProfile } from "../services/resumeProfileService.js";
import { matchInternships } from "../services/internshipMatcherService.js";

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
