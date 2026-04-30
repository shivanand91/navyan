import { Course } from "../models/Course.js";
import {
  buildYouTubeEmbedUrl,
  buildYouTubeThumbnailUrl,
  buildYouTubeWatchUrl,
  extractYouTubeVideoId
} from "../utils/youtube.js";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const toCourseResponse = (course) => {
  const raw = course?.toObject ? course.toObject() : course;
  const videoId = raw.videoId || extractYouTubeVideoId(raw.youtubeUrl);

  return {
    ...raw,
    videoId,
    embedUrl: buildYouTubeEmbedUrl(videoId),
    thumbnailUrl: buildYouTubeThumbnailUrl(videoId),
    watchUrl: buildYouTubeWatchUrl(videoId)
  };
};

export const listPublicCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true, isDeleted: false }).sort({
      createdAt: -1
    });

    res.json({ courses: courses.map(toCourseResponse) });
  } catch (err) {
    next(err);
  }
};

export const adminListCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json({ courses: courses.map(toCourseResponse) });
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      category,
      level,
      durationLabel,
      shortDescription,
      youtubeUrl,
      isPublished
    } = req.body;

    if (!title || !youtubeUrl) {
      return res.status(400).json({ message: "Course title and YouTube URL are required." });
    }

    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ message: "Enter a valid YouTube URL." });
    }

    const normalizedSlug = slugify(slug || title);
    if (!normalizedSlug) {
      return res.status(400).json({ message: "A valid slug could not be generated for this course." });
    }

    const course = await Course.create({
      title,
      slug: normalizedSlug,
      category,
      level,
      durationLabel,
      shortDescription,
      youtubeUrl: buildYouTubeWatchUrl(videoId),
      videoId,
      isPublished: isPublished !== false,
      createdBy: req.user?._id
    });

    res.status(201).json({ course: toCourseResponse(course) });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: "A course with this slug already exists." });
    }
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course || course.isDeleted) {
      return res.status(404).json({ message: "Course not found." });
    }

    const nextYoutubeUrl = req.body.youtubeUrl ?? course.youtubeUrl;
    const nextVideoId = extractYouTubeVideoId(nextYoutubeUrl);

    if (!nextVideoId) {
      return res.status(400).json({ message: "Enter a valid YouTube URL." });
    }

    course.title = req.body.title ?? course.title;
    course.slug = slugify(req.body.slug || course.slug || req.body.title || course.title);
    course.category = req.body.category ?? course.category;
    course.level = req.body.level ?? course.level;
    course.durationLabel = req.body.durationLabel ?? course.durationLabel;
    course.shortDescription = req.body.shortDescription ?? course.shortDescription;
    course.youtubeUrl = buildYouTubeWatchUrl(nextVideoId);
    course.videoId = nextVideoId;
    course.isPublished =
      typeof req.body.isPublished === "boolean" ? req.body.isPublished : course.isPublished;

    await course.save();

    res.json({ course: toCourseResponse(course) });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: "A course with this slug already exists." });
    }
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course || course.isDeleted) {
      return res.status(404).json({ message: "Course not found." });
    }

    course.isDeleted = true;
    course.isPublished = false;
    await course.save();

    res.json({ message: "Course removed from live listings." });
  } catch (err) {
    next(err);
  }
};
