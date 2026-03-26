import express from "express";
import { SiteVisitor } from "../models/SiteVisitor.js";

const router = express.Router();

const buildPublicStats = async () => {
  const [uniqueVisitors, totals] = await Promise.all([
    SiteVisitor.countDocuments(),
    SiteVisitor.aggregate([
      {
        $group: {
          _id: null,
          totalVisits: { $sum: "$visitCount" }
        }
      }
    ])
  ]);

  return {
    uniqueVisitors,
    totalVisits: totals[0]?.totalVisits || 0
  };
};

router.get("/public", async (req, res, next) => {
  try {
    const stats = await buildPublicStats();
    res.json({ stats });
  } catch (err) {
    next(err);
  }
});

router.post("/visit", async (req, res, next) => {
  try {
    const visitorId = String(req.body?.visitorId || "").trim();
    const path = String(req.body?.path || "/").trim() || "/";
    const referrer = String(req.body?.referrer || "").trim();

    if (visitorId.length < 12) {
      return res.status(400).json({ message: "A valid visitor ID is required" });
    }

    const now = new Date();

    await SiteVisitor.updateOne(
      { visitorId },
      {
        $set: {
          lastSeenAt: now,
          lastPath: path.slice(0, 300),
          referrer: referrer.slice(0, 500),
          userAgent: String(req.get("user-agent") || "").slice(0, 500)
        },
        $setOnInsert: {
          firstSeenAt: now
        },
        $inc: {
          visitCount: 1
        }
      },
      { upsert: true }
    );

    const stats = await buildPublicStats();
    res.status(201).json({ stats });
  } catch (err) {
    next(err);
  }
});

export default router;
