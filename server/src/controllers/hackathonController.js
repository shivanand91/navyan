import { Hackathon } from "../models/Hackathon.js";
import { uploadBuffer } from "../services/cloudinaryUpload.js";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const listPublicHackathons = async (req, res, next) => {
  try {
    const hackathons = await Hackathon.find({
      isPublished: true,
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.json({ hackathons });
  } catch (error) {
    next(error);
  }
};

export const adminListHackathons = async (req, res, next) => {
  try {
    const hackathons = await Hackathon.find({
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.json({ hackathons });
  } catch (error) {
    next(error);
  }
};

export const adminCreateHackathon = async (req, res, next) => {
  try {
    const body = { ...req.body };

    const { title, slug, description, minTeamSize, maxTeamSize, registrationLink, isPublished } = body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const normalizedSlug = slugify(slug || title);
    if (!normalizedSlug) {
      return res.status(400).json({ message: "A valid slug could not be generated." });
    }

    let coverImageUrl = body.coverImageUrl || "";
    if (req.file?.buffer) {
      const uploaded = await uploadBuffer({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        folder: "navyan/hackathons",
        publicId: normalizedSlug,
        resourceType: "image"
      });
      coverImageUrl = uploaded.url;
    }

    const hackathon = await Hackathon.create({
      title,
      slug: normalizedSlug,
      description,
      coverImageUrl,
      minTeamSize: Number(minTeamSize || 1),
      maxTeamSize: Number(maxTeamSize || 4),
      registrationLink,
      isPublished: isPublished !== "false",
      createdBy: req.user?._id
    });

    res.status(201).json({ hackathon });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "A hackathon with this slug already exists." });
    }
    next(error);
  }
};

export const adminUpdateHackathon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const hackathon = await Hackathon.findOne({ _id: id, isDeleted: false });
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found." });
    }

    const title = updates.title ?? hackathon.title;
    const nextSlug = slugify(updates.slug || hackathon.slug || title);

    if (req.file?.buffer) {
      const uploaded = await uploadBuffer({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        folder: "navyan/hackathons",
        publicId: nextSlug,
        resourceType: "image"
      });
      updates.coverImageUrl = uploaded.url;
    }

    hackathon.title = title;
    hackathon.slug = nextSlug;
    hackathon.description = updates.description ?? hackathon.description;
    if (updates.coverImageUrl !== undefined) {
      hackathon.coverImageUrl = updates.coverImageUrl;
    }
    hackathon.minTeamSize = updates.minTeamSize !== undefined ? Number(updates.minTeamSize) : hackathon.minTeamSize;
    hackathon.maxTeamSize = updates.maxTeamSize !== undefined ? Number(updates.maxTeamSize) : hackathon.maxTeamSize;
    hackathon.registrationLink = updates.registrationLink ?? hackathon.registrationLink;
    if (updates.isPublished !== undefined) {
      hackathon.isPublished = updates.isPublished !== "false" && updates.isPublished !== false;
    }

    await hackathon.save();

    res.json({ hackathon });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "A hackathon with this slug already exists." });
    }
    next(error);
  }
};

export const adminDeleteHackathon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findOne({ _id: id, isDeleted: false });
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found." });
    }

    hackathon.isDeleted = true;
    hackathon.isPublished = false;
    await hackathon.save();

    res.json({ message: "Hackathon deleted successfully.", hackathon });
  } catch (error) {
    next(error);
  }
};
