import mongoose from "mongoose";

const siteVisitorSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, unique: true, index: true },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    visitCount: { type: Number, default: 1 },
    lastPath: { type: String, default: "/" },
    referrer: { type: String, default: "" },
    userAgent: { type: String, default: "" }
  },
  { timestamps: true }
);

export const SiteVisitor = mongoose.model("SiteVisitor", siteVisitorSchema);
