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
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service"
    },
    service: { type: String, required: true },
    inquiryType: {
      type: String,
      enum: ["inquiry", "call"],
      default: "inquiry",
      index: true
    },
    budgetRange: String,
    description: String,
    timeline: String,
    scheduledCallAt: Date,
    referenceLinks: [String],
    status: { type: String, enum: STATUS, default: "New", index: true }
  },
  { timestamps: true }
);

export const ServiceInquiry = mongoose.model("ServiceInquiry", serviceInquirySchema);
