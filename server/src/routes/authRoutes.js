import express from "express";
import {
  registerStudent,
  login,
  requestPasswordReset,
  resetPassword,
  me,
  seedAdminDev,
  refreshSession,
  logout
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/refresh", refreshSession);
router.post("/logout", logout);
router.get("/me", protect, me);
router.post("/seed-admin", seedAdminDev);

export default router;
