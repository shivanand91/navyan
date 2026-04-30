import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import {
  adminListCourses,
  createCourse,
  deleteCourse,
  listPublicCourses,
  updateCourse
} from "../controllers/courseController.js";

const router = express.Router();

router.get("/", listPublicCourses);
router.get("/admin", protect, requireAdmin, adminListCourses);
router.post("/admin", protect, requireAdmin, createCourse);
router.put("/admin/:id", protect, requireAdmin, updateCourse);
router.delete("/admin/:id", protect, requireAdmin, deleteCourse);

export default router;
