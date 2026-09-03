import express from "express";
import { optionalProtect } from "../middleware/authMiddleware.js";
import { trackPublicActivity } from "../controllers/activityTrackingController.js";

const router = express.Router();
router.post("/track", optionalProtect, trackPublicActivity);
export default router;
