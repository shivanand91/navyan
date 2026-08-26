import express from "express";
import {
  createTicket,
  getMyTickets,
  getTicketById,
  replyToTicket,
  getAllTicketsAdmin,
  updateTicketStatusAdmin
} from "../controllers/supportController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTicket);
router.get("/my", protect, getMyTickets);
router.get("/admin/all", protect, requireAdmin, getAllTicketsAdmin);
router.get("/:id", protect, getTicketById);
router.post("/:id/reply", protect, replyToTicket);
router.patch("/admin/:id/status", protect, requireAdmin, updateTicketStatusAdmin);

export default router;
