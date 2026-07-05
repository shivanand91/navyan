import express from "express";
import mongoose from "mongoose";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { ServiceInquiry } from "../models/ServiceInquiry.js";

const router = express.Router();

const optionalString = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

// Public: create service inquiry
router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      serviceId,
      service,
      inquiryType,
      budgetRange,
      description,
      timeline,
      scheduledCallAt,
      referenceLinks
    } = req.body;

    const normalizedServiceId = optionalString(serviceId);
    const normalizedScheduledCallAt = optionalString(scheduledCallAt);

    if (normalizedServiceId && !mongoose.Types.ObjectId.isValid(normalizedServiceId)) {
      return res.status(400).json({ message: "Invalid service reference." });
    }

    if (inquiryType === "call" && !normalizedScheduledCallAt) {
      return res.status(400).json({ message: "Select a valid date and time for the call." });
    }

    if (normalizedScheduledCallAt && Number.isNaN(new Date(normalizedScheduledCallAt).getTime())) {
      return res.status(400).json({ message: "Select a valid date and time for the call." });
    }

    const inquiry = await ServiceInquiry.create({
      name: optionalString(name),
      email: optionalString(email),
      phone: optionalString(phone),
      company: optionalString(company),
      serviceId: normalizedServiceId,
      service: optionalString(service),
      inquiryType: inquiryType === "call" ? "call" : "inquiry",
      budgetRange: optionalString(budgetRange),
      description: optionalString(description),
      timeline: optionalString(timeline),
      scheduledCallAt: normalizedScheduledCallAt,
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
    const inquiries = await ServiceInquiry.find()
      .populate("serviceId", "title slug")
      .sort({ createdAt: -1 });
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

router.delete("/admin/:id", protect, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const inquiry = await ServiceInquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    if (inquiry.status !== "Closed Lost") {
      return res.status(400).json({
        message: "Only leads marked as Closed Lost can be deleted."
      });
    }

    await ServiceInquiry.findByIdAndDelete(id);

    res.json({ message: "Lead deleted successfully." });
  } catch (err) {
    next(err);
  }
});

export default router;
