import { Internship } from "../models/Internship.js";
import { uploadBuffer } from "../services/cloudinaryUpload.js";

export const listPublishedInternships = async (req, res, next) => {
  try {
    const internships = await Internship.find({ isPublished: true, isDeleted: { $ne: true } }).sort({
      createdAt: -1
    });
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
    });
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.json({ internship });
  } catch (err) {
    next(err);
  }
};

export const adminListInternships = async (req, res, next) => {
  try {
    const internships = await Internship.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
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
      durations: body.durations,
      coverImageUrl
    });

    res.status(201).json({ internship });
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
