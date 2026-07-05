import { Service } from "../models/Service.js";
import { uploadBuffer } from "../services/cloudinaryUpload.js";

const normalizeHighlights = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const listPublishedServices = async (req, res, next) => {
  try {
    const services = await Service.find({
      isPublished: true,
      isDeleted: { $ne: true }
    }).sort({ createdAt: -1 });

    res.json({ services });
  } catch (error) {
    next(error);
  }
};

export const adminListServices = async (req, res, next) => {
  try {
    const services = await Service.find({
      isDeleted: { $ne: true }
    }).sort({ createdAt: -1 });

    res.json({ services });
  } catch (error) {
    next(error);
  }
};

export const adminCreateService = async (req, res, next) => {
  try {
    const body = { ...req.body };

    let featureImageUrl = body.featureImageUrl;
    if (req.file?.buffer) {
      const uploaded = await uploadBuffer({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        folder: "navyan/services",
        publicId: body.slug || body.title,
        resourceType: "image"
      });
      featureImageUrl = uploaded.url;
    }

    const service = await Service.create({
      title: body.title,
      slug: body.slug,
      shortDescription: body.shortDescription,
      description: body.description,
      category: body.category,
      featureImageUrl,
      highlights: normalizeHighlights(body.highlights),
      isPublished: body.isPublished !== "false"
    });

    res.status(201).json({ service });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.file?.buffer) {
      const uploaded = await uploadBuffer({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        folder: "navyan/services",
        publicId: updates.slug || id,
        resourceType: "image"
      });
      updates.featureImageUrl = uploaded.url;
    }

    if ("highlights" in updates) {
      updates.highlights = normalizeHighlights(updates.highlights);
    }

    const service = await Service.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      updates,
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ service });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service || service.isDeleted) {
      return res.status(404).json({ message: "Service not found" });
    }

    service.isDeleted = true;
    service.isPublished = false;
    service.deletedAt = new Date();
    await service.save();

    res.json({
      message: "Service removed from public listings.",
      service
    });
  } catch (error) {
    next(error);
  }
};
