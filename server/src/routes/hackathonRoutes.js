import express from "express";
import {
  adminCreateHackathon,
  adminDeleteHackathon,
  adminListHackathons,
  adminUpdateHackathon,
  listPublicHackathons
} from "../controllers/hackathonController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", listPublicHackathons);
router.get("/admin", protect, requireAdmin, adminListHackathons);
router.post("/admin", protect, requireAdmin, upload.single("coverImage"), adminCreateHackathon);
router.put("/admin/:id", protect, requireAdmin, upload.single("coverImage"), adminUpdateHackathon);
router.delete("/admin/:id", protect, requireAdmin, adminDeleteHackathon);

export default router;
