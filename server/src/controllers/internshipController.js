import { Internship } from "../models/Internship.js";
import { uploadBuffer } from "../services/cloudinaryUpload.js";

const ensureDefaultDurations = async (internship) => {
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
    await internship.save();
  }
};

export const listPublishedInternships = async (req, res, next) => {
  try {
    const internships = await Internship.find({ isPublished: true, isDeleted: { $ne: true } }).sort({
      createdAt: -1
    });
    for (const internship of internships) {
      await ensureDefaultDurations(internship);
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
    });
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    await ensureDefaultDurations(internship);
    res.json({ internship });
  } catch (err) {
    next(err);
  }
};

export const adminListInternships = async (req, res, next) => {
  try {
    const internships = await Internship.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    for (const internship of internships) {
      await ensureDefaultDurations(internship);
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
