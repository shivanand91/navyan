import mongoose from "mongoose";

const STATUS = [
  "New",
  "Contacted",
  "Meeting Scheduled",
  "Proposal Sent",
  "Closed Won",
  "Closed Lost"
];

const serviceInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: String,
    service: { type: String, required: true },
    budgetRange: String,
    description: String,
    timeline: String,
    referenceLinks: [String],
    status: { type: String, enum: STATUS, default: "New", index: true }
  },
  { timestamps: true }
);

export const ServiceInquiry = mongoose.model("ServiceInquiry", serviceInquirySchema);

