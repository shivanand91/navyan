import express from "express";
import {
  registerStudent,
  login,
  me,
  seedAdminDev,
  refreshSession,
  logout
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", login);
router.post("/refresh", refreshSession);
router.post("/logout", logout);
router.get("/me", protect, me);
router.post("/seed-admin", seedAdminDev);

export default router;
