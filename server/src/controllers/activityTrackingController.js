import crypto from "crypto";
import { getApiCookieOptions } from "../utils/cookies.js";
import { trackActivity } from "../services/adminActivityService.js";

const ACTIVITY_SESSION_COOKIE = "navyan_activity_session";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const summarizeDevice = (userAgent = "") => ({
  device: /mobile|android|iphone/i.test(userAgent) ? "mobile" : "desktop",
  browser: /edg\//i.test(userAgent) ? "Edge" : /firefox\//i.test(userAgent) ? "Firefox" : /chrome\//i.test(userAgent) ? "Chrome" : /safari\//i.test(userAgent) ? "Safari" : "Other",
  os: /android/i.test(userAgent) ? "Android" : /iphone|ipad|mac os/i.test(userAgent) ? "Apple" : /windows/i.test(userAgent) ? "Windows" : /linux/i.test(userAgent) ? "Linux" : "Other"
});

export const trackPublicActivity = async (req, res) => {
  const { eventType, internshipId, internshipTitle, path } = req.body || {};
  if (!["USER_VISIT", "INTERNSHIP_VIEW"].includes(eventType)) {
    return res.status(400).json({ message: "Unsupported activity event" });
  }

  const sessionId = req.cookies?.[ACTIVITY_SESSION_COOKIE] || `sess_${crypto.randomBytes(12).toString("base64url")}`;
  if (!req.cookies?.[ACTIVITY_SESSION_COOKIE]) {
    res.cookie(ACTIVITY_SESSION_COOKIE, sessionId, getApiCookieOptions(SESSION_MAX_AGE));
  }

  const userName = req.user?.fullName || req.user?.profile?.fullName;
  const location = typeof path === "string" ? path.slice(0, 250) : "/";
  const isInternshipView = eventType === "INTERNSHIP_VIEW";
  await trackActivity({
    eventType,
    user: req.user,
    sessionId,
    internship: internshipId,
    title: isInternshipView ? "Internship viewed" : "Visitor browsing Navyan",
    message: isInternshipView ? `${userName || "A visitor"} viewed ${String(internshipTitle || "an internship").slice(0, 160)}.` : `${userName || "A visitor"} opened ${location}.`,
    metadata: { path: location, internshipTitle: String(internshipTitle || "").slice(0, 160), ...summarizeDevice(req.get("user-agent")) },
    dedupeKey: `${eventType}:${sessionId}:${internshipId || location}`,
    dedupeWindowMs: isInternshipView ? 10 * 60 * 1000 : 5 * 60 * 1000
  });

  res.status(202).json({ accepted: true });
};
