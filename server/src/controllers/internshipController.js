import { Internship } from "../models/Internship.js";
import mongoose from "mongoose";
import { uploadBuffer } from "../services/cloudinaryUpload.js";
import { normalizeHttpUrl } from "../utils/url.js";

const normalizePdfUrl = (value) => {
  const normalized = normalizeHttpUrl(value);

  if (normalized === null) {
    const error = new Error("PDF/task document link must be a valid HTTP(S) URL");
    error.statusCode = 400;
    throw error;
  }

  return normalized;
};

const ensureDefaultDurations = (internship) => {
  if (!internship) return;
  const standardDurations = [
    {
      key: "4-weeks",
      label: "4 weeks",
      isPaid: true,
      price: 49,
      benefits: ["Workspace Access", "3 Real-world Projects", "Verifiable Certificate", "Weekly Q&A"],
      rewards: ["Performance Recognition"],
      description: "Introductory developer track",
      mentorship: "Weekly group Q&A",
      schedule: "Self-paced",
      projects: ["3 Practice projects"],
      tasks: ["Weekly submissions"],
      certificate: "Digital Certificate",
      swag: "Digital Certificate only",
      eligibility: "Open to all students"
    },
    {
      key: "3-months",
      label: "3 months",
      isPaid: true,
      price: 2499,
      benefits: ["Workspace Access", "3 Real-world Projects", "Live Classes", "Stipend Reward", "Navyan Swag Box"],
      rewards: ["Top 3 Performers: ₹5,000"],
      description: "Deep-dive professional developer track",
      mentorship: "1-on-1 Project reviews",
      schedule: "Weekend Live Classes",
      projects: ["3 Portfolio projects"],
      tasks: ["Advanced task sets"],
      certificate: "Premium Certificate",
      swag: "Navyan Swag Box (T-shirt, Sticker)",
      eligibility: "Basic coding knowledge"
    },
    {
      key: "6-months",
      label: "6 months",
      isPaid: true,
      price: 4499,
      benefits: ["Workspace Access", "3 Real-world Projects", "Live Classes", "Dedicated Mentor", "Elite Swag Hoodie Box"],
      rewards: ["Top Performer: ₹8,000"],
      description: "Production grade enterprise developer track",
      mentorship: "Dedicated Slack Coach & reviews",
      schedule: "Weekend Live Classes & Roadmaps",
      projects: ["3 Production capstone projects"],
      tasks: ["Enterprise architecture tasks"],
      certificate: "Elite Certificate",
      swag: "Navyan Elite Swag (Hoodie, T-Shirt, Swag Kit)",
      eligibility: "Intermediate programming skills"
    }
  ];

  const fourWeeks = internship.durations?.find(d => d.key === "4-weeks");
  const threeMonths = internship.durations?.find(d => d.key === "3-months");
  const sixMonths = internship.durations?.find(d => d.key === "6-months");

  if (!fourWeeks || fourWeeks.price !== 49 || !threeMonths || threeMonths.price !== 2499 || !sixMonths || sixMonths.price !== 4499) {
    internship.durations = standardDurations;
  }
};

export const listPublishedInternships = async (req, res, next) => {
  try {
    const internships = await Internship.find({ isPublished: true, isDeleted: { $ne: true } })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    for (const internship of internships) {
      ensureDefaultDurations(internship);
    }
    res.json({ internships });
  } catch (err) {
    next(err);
  }
};

export const getInternshipBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const internship = await Internship.findOne({
      slug,
      isPublished: true,
      isDeleted: { $ne: true }
    }).lean();

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    ensureDefaultDurations(internship);
    res.json({ internship });
  } catch (err) {
    next(err);
  }
};

export const adminListInternships = async (req, res, next) => {
  try {
    const internships = await Internship.find({ isDeleted: { $ne: true } })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    for (const internship of internships) {
      ensureDefaultDurations(internship);
    }
    res.json({ internships });
  } catch (err) {
    next(err);
  }
};

export const adminCreateInternship = async (req, res, next) => {
  try {
    const body = { ...req.body };
    // Support multipart/form-data where arrays/objects come as strings
    if (typeof body.skillsRequired === "string") {
      body.skillsRequired = body.skillsRequired
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (typeof body.durations === "string") {
      try {
        body.durations = JSON.parse(body.durations);
      } catch {
        body.durations = [];
      }
    }
    body.pdfUrl = normalizePdfUrl(body.pdfUrl);

    let coverImageUrl = body.coverImageUrl;
    if (req.file?.buffer) {
      const uploaded = await uploadBuffer({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        folder: "navyan/internships",
        publicId: body.slug || body.title,
        resourceType: "image"
      });
      coverImageUrl = uploaded.url;
    }

    const latestOrderedInternship = await Internship.findOne({ isDeleted: { $ne: true } })
      .sort({ sortOrder: -1 })
      .select("sortOrder")
      .lean();
    const activeInternshipCount = await Internship.countDocuments({ isDeleted: { $ne: true } });
    const sortOrder = Number.isFinite(latestOrderedInternship?.sortOrder)
      ? latestOrderedInternship.sortOrder + 1
      : activeInternshipCount;

    const internship = await Internship.create({
      title: body.title,
      slug: body.slug,
      shortDescription: body.shortDescription,
      description: body.description,
      role: body.role,
      mode: body.mode,
      skillsRequired: body.skillsRequired,
      openings: body.openings,
      lastDateToApply: body.lastDateToApply,
      isPublished: body.isPublished,
      pdfUrl: body.pdfUrl,
      sortOrder,
      durations: body.durations,
      coverImageUrl
    });

    res.status(201).json({ internship });
  } catch (err) {
    next(err);
  }
};

export const adminReorderInternships = async (req, res, next) => {
  try {
    const items = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "A complete internship order is required" });
    }

    const ids = items.map((item) => item?.id);
    if (
      ids.some((id) => !mongoose.isValidObjectId(id)) ||
      new Set(ids.map(String)).size !== ids.length
    ) {
      return res.status(400).json({ message: "The internship order contains invalid or duplicate IDs" });
    }

    const activeInternshipCount = await Internship.countDocuments({ isDeleted: { $ne: true } });
    const matchedCount = await Internship.countDocuments({
      _id: { $in: ids },
      isDeleted: { $ne: true }
    });
    if (matchedCount !== ids.length || ids.length !== activeInternshipCount) {
      return res.status(400).json({
        message: "The internship list changed. Refresh the page and try again."
      });
    }

    await Internship.bulkWrite(
      ids.map((id, sortOrder) => ({
        updateOne: {
          filter: { _id: id, isDeleted: { $ne: true } },
          update: { $set: { sortOrder } }
        }
      }))
    );

    res.json({ message: "Internship order updated successfully" });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateInternship = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (typeof updates.skillsRequired === "string") {
      updates.skillsRequired = updates.skillsRequired
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (typeof updates.durations === "string") {
      try {
        updates.durations = JSON.parse(updates.durations);
      } catch {
        // ignore
      }
    }
    if (Object.prototype.hasOwnProperty.call(updates, "pdfUrl")) {
      updates.pdfUrl = normalizePdfUrl(updates.pdfUrl);
    }

    if (req.file?.buffer) {
      const uploaded = await uploadBuffer({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        folder: "navyan/internships",
        publicId: updates.slug || id,
        resourceType: "image"
      });
      updates.coverImageUrl = uploaded.url;
    }

    const internship = await Internship.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      updates,
      {
      new: true
      }
    );
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.json({ internship });
  } catch (err) {
    next(err);
  }
};

export const adminDeleteInternship = async (req, res, next) => {
  try {
    const { id } = req.params;

    const internship = await Internship.findById(id);
    if (!internship || internship.isDeleted) {
      return res.status(404).json({ message: "Internship not found" });
    }

    const originalSlug = internship.archivedSlug || internship.slug;
    internship.archivedSlug = originalSlug;
    internship.slug = `${originalSlug}--archived--${Date.now()}`;
    internship.isPublished = false;
    internship.isDeleted = true;
    internship.deletedAt = new Date();
    internship.deletedBy = req.user._id;

    await internship.save();

    res.json({
      message:
        "Internship deleted from live listings. Existing student applications and certificates are preserved.",
      internship
    });
  } catch (err) {
    next(err);
  }
};
