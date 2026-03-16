import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { ServiceInquiry } from "../models/ServiceInquiry.js";

const router = express.Router();

// Public: create service inquiry
router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      service,
      budgetRange,
      description,
      timeline,
      referenceLinks
    } = req.body;

    const inquiry = await ServiceInquiry.create({
      name,
      email,
      phone,
      company,
      service,
      budgetRange,
      description,
      timeline,
      referenceLinks
    });

    res.status(201).json({ inquiry });
  } catch (err) {
    next(err);
  }
});

// Admin: list + update status
router.get("/admin", protect, requireAdmin, async (req, res, next) => {
  try {
    const inquiries = await ServiceInquiry.find().sort({ createdAt: -1 });
    res.json({ inquiries });
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/:id", protect, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const inquiry = await ServiceInquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }
    res.json({ inquiry });
  } catch (err) {
    next(err);
  }
});

export default router;

