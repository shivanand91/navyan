import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { adminListRewards, adminListWithdrawals, adminShareEarnOverview, adminUpdateWithdrawal, createShareLink, getWallet, requestWithdrawal, resolveShareLink } from "../controllers/shareEarnController.js";

const router = express.Router();
router.get("/links/:token", resolveShareLink);
router.post("/links", protect, createShareLink);
router.get("/wallet", protect, getWallet);
router.post("/withdrawals", protect, requestWithdrawal);
router.get("/admin/overview", protect, requireAdmin, adminShareEarnOverview);
router.get("/admin/withdrawals", protect, requireAdmin, adminListWithdrawals);
router.get("/admin/rewards", protect, requireAdmin, adminListRewards);
router.patch("/admin/withdrawals/:id", protect, requireAdmin, adminUpdateWithdrawal);
export default router;
