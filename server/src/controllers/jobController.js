import { Job } from "../models/Job.js";
import { JobApplication } from "../models/JobApplication.js";
import { User } from "../models/User.js";
import { sendNewJobPostedEmail } from "../services/emailService.js";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag || "").trim()).filter(Boolean);
  }

  return String(tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const toJobResponse = (job) => ({
  ...job.toObject(),
  isInternal: job.sourceType === "internal",
  isExternal: job.sourceType === "external"
});

const buildApplicantSnapshot = (user) => ({
  fullName: user?.profile?.fullName || user?.fullName || "",
  email: user?.profile?.email || user?.email || "",
  phone: user?.profile?.phone || "",
  city: user?.profile?.city || "",
  state: user?.profile?.state || "",
  college: user?.profile?.college || "",
  degree: user?.profile?.degree || "",
  branch: user?.profile?.branch || "",
  resumeUrl: user?.profile?.resumeUrl || "",
  portfolioUrl: user?.profile?.portfolioUrl || "",
  githubUrl: user?.profile?.githubUrl || "",
  linkedinUrl: user?.profile?.linkedinUrl || ""
});

export const listPublicJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ isPublished: true, isDeleted: false }).sort({ createdAt: -1 });
    res.json({ jobs: jobs.map(toJobResponse) });
  } catch (err) {
    next(err);
  }
};

export const adminListJobs = async (req, res, next) => {
  try {
    const [jobs, applications] = await Promise.all([
      Job.find({ isDeleted: false }).sort({ createdAt: -1 }),
      JobApplication.find()
        .populate("job")
        .populate({ path: "user", select: "fullName email profile" })
        .sort({ createdAt: -1 })
    ]);

    res.json({
      jobs: jobs.map(toJobResponse),
      applications: applications.map((application) => application.toObject())
    });
  } catch (err) {
    next(err);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      companyName,
      description,
      role,
      field,
      location,
      employmentType,
      sourceType,
      applyUrl,
      tags,
      isPublished
    } = req.body;

    if (!title || !companyName || !description) {
      return res.status(400).json({ message: "Title, company name, and description are required." });
    }

    if (sourceType === "external" && !applyUrl) {
      return res.status(400).json({ message: "External jobs require an apply link." });
    }

    const normalizedSlug = slugify(slug || `${title}-${companyName}`);
    if (!normalizedSlug) {
      return res.status(400).json({ message: "A valid slug could not be generated for this job." });
    }

    const job = await Job.create({
      title,
      slug: normalizedSlug,
      companyName,
      description,
      role,
      field,
      location,
      employmentType,
      sourceType: sourceType === "external" ? "external" : "internal",
      applyUrl: sourceType === "external" ? String(applyUrl || "").trim() : "",
      tags: normalizeTags(tags),
      isPublished: isPublished !== false,
      createdBy: req.user?._id
    });

    let emailStats = null;
    if (job.isPublished) {
      try {
        const students = await User.find({ role: "student" }).select("fullName email profile");
        const deliveries = await Promise.allSettled(
          students.map((student) => sendNewJobPostedEmail({ user: student, job }))
        );

        emailStats = {
          total: deliveries.length,
          sent: deliveries.filter((item) => item.status === "fulfilled" && item.value).length
        };
      } catch (error) {
        console.error("Job notification email broadcast failed", error);
      }
    }

    res.status(201).json({
      job: toJobResponse(job),
      emailStats
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: "A job with this slug already exists." });
    }
    next(err);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      companyName,
      description,
      role,
      field,
      location,
      employmentType,
      sourceType,
      applyUrl,
      tags,
      isPublished
    } = req.body;

    const job = await Job.findById(id);
    if (!job || job.isDeleted) {
      return res.status(404).json({ message: "Job not found." });
    }

    const nextSourceType = sourceType === "external" ? "external" : "internal";
    if (nextSourceType === "external" && !applyUrl) {
      return res.status(400).json({ message: "External jobs require an apply link." });
    }

    job.title = title ?? job.title;
    job.slug = slugify(slug || job.slug || `${title || job.title}-${companyName || job.companyName}`);
    job.companyName = companyName ?? job.companyName;
    job.description = description ?? job.description;
    job.role = role ?? job.role;
    job.field = field ?? job.field;
    job.location = location ?? job.location;
    job.employmentType = employmentType ?? job.employmentType;
    job.sourceType = nextSourceType;
    job.applyUrl = nextSourceType === "external" ? String(applyUrl || "").trim() : "";
    job.tags = tags !== undefined ? normalizeTags(tags) : job.tags;
    job.isPublished = typeof isPublished === "boolean" ? isPublished : job.isPublished;

    await job.save();

    res.json({ job: toJobResponse(job) });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: "A job with this slug already exists." });
    }
    next(err);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.isDeleted) {
      return res.status(404).json({ message: "Job not found." });
    }

    job.isDeleted = true;
    job.isPublished = false;
    await job.save();

    res.json({ message: "Job removed from live listings." });
  } catch (err) {
    next(err);
  }
};

export const applyToInternalJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job || job.isDeleted || !job.isPublished) {
      return res.status(404).json({ message: "Job not found." });
    }

    if (job.sourceType !== "internal") {
      return res.status(400).json({ message: "This job uses an external apply link." });
    }

    const existingApplication = await JobApplication.findOne({
      job: job._id,
      user: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied to this job." });
    }

    const application = await JobApplication.create({
      job: job._id,
      user: req.user._id,
      applicantSnapshot: buildApplicantSnapshot(req.user)
    });

    res.status(201).json({ application });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: "You have already applied to this job." });
    }
    next(err);
  }
};

export const listMyJobApplications = async (req, res, next) => {
  try {
    const applications = await JobApplication.find({ user: req.user._id })
      .populate("job")
      .sort({ createdAt: -1 });

    res.json({ applications: applications.map((application) => application.toObject()) });
  } catch (err) {
    next(err);
  }
};
