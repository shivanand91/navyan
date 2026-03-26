import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import {
  adminListJobs,
  applyToInternalJob,
  createJob,
  deleteJob,
  listMyJobApplications,
  listPublicJobs,
  updateJob
} from "../controllers/jobController.js";

const router = express.Router();

router.get("/", listPublicJobs);
router.post("/:id/apply", protect, applyToInternalJob);
router.get("/me/applications", protect, listMyJobApplications);

router.get("/admin", protect, requireAdmin, adminListJobs);
router.post("/admin", protect, requireAdmin, createJob);
router.put("/admin/:id", protect, requireAdmin, updateJob);
router.delete("/admin/:id", protect, requireAdmin, deleteJob);

export default router;
