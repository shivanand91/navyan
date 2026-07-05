import express from "express";
import { broadcastAlert } from "../controllers/alertController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/broadcast", protect, requireAdmin, broadcastAlert);

export default router;
