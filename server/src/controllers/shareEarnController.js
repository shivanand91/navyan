import crypto from "crypto";
import { Internship } from "../models/Internship.js";
import { ShareLink } from "../models/ShareLink.js";
import { ShareAttribution } from "../models/ShareAttribution.js";
import { Wallet } from "../models/Wallet.js";
import { WalletTransaction } from "../models/WalletTransaction.js";
import { Withdrawal } from "../models/Withdrawal.js";
import { ShareVisit } from "../models/ShareVisit.js";

const ATTRIBUTION_DAYS = 30;
const MIN_WITHDRAWAL = 50;
const UPI_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;
const maskUpi = (upi) => `${upi.slice(0, Math.min(3, upi.length))}****${upi.slice(upi.indexOf("@"))}`;
const buildShareUrl = (req, internshipSlug, token) =>
  `${process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`}/internship/${encodeURIComponent(internshipSlug)}?share=${encodeURIComponent(token)}`;
export const getRequestIpHash = (req) => crypto.createHash("sha256").update(String(req.ip || "")).digest("hex");

export const createShareLink = async (req, res, next) => {
  try {
    const internship = await Internship.findOne({ _id: req.body.internshipId, isPublished: true, isDeleted: { $ne: true } });
    if (!internship) return res.status(404).json({ message: "Internship not found" });
    let link = await ShareLink.findOne({ owner: req.user._id, internship: internship._id, isActive: true });
    if (!link) link = await ShareLink.create({ owner: req.user._id, internship: internship._id, token: crypto.randomBytes(18).toString("base64url"), creatorIpHash: getRequestIpHash(req) });
    res.status(201).json({
      success: true,
      token: link.token,
      // Use the existing internship page route so shared links work even on hosts without a short-link SPA rewrite.
      shareUrl: buildShareUrl(req, internship.slug, link.token)
    });
  } catch (error) { next(error); }
};

export const resolveShareLink = async (req, res, next) => {
  try {
    const link = await ShareLink.findOneAndUpdate({ token: req.params.token, isActive: true }, { $inc: { clicks: 1 } }, { new: true }).populate("internship", "slug");
    if (!link?.internship) return res.status(404).json({ message: "This share link is no longer available" });
    const visitorToken = req.cookies?.navyan_share_visitor || crypto.randomBytes(18).toString("base64url");
    const expiresAt = new Date(Date.now() + ATTRIBUTION_DAYS * 24 * 60 * 60 * 1000);
    await ShareVisit.findOneAndUpdate(
      { visitorToken, shareLink: link._id },
      { $set: { clickedAt: new Date(), expiresAt, ipHash: getRequestIpHash(req) } },
      { upsert: true }
    );
    res.cookie("navyan_share_visitor", visitorToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ATTRIBUTION_DAYS * 24 * 60 * 60 * 1000
    });
    res.json({ internshipSlug: link.internship.slug, redirectPath: `/internship/${link.internship.slug}`, token: link.token });
  } catch (error) { next(error); }
};

export const getWallet = async (req, res, next) => {
  try {
    const [wallet, transactions, withdrawals] = await Promise.all([
      Wallet.findOne({ user: req.user._id }).lean(),
      WalletTransaction.find({ user: req.user._id }).populate("internship", "title").sort({ createdAt: -1 }).limit(20).lean(),
      Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10).lean()
    ]);
    res.json({
      wallet: wallet || { availableBalance: 0, pendingBalance: 0, totalEarned: 0, totalWithdrawn: 0 },
      transactions,
      withdrawals: withdrawals.map((item) => ({ ...item, upiId: maskUpi(item.upiId) })),
      minimumWithdrawal: MIN_WITHDRAWAL
    });
  } catch (error) { next(error); }
};

export const requestWithdrawal = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    const upiId = String(req.body.upiId || "").trim().toLowerCase();
    if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL) return res.status(400).json({ message: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL}.` });
    if (!UPI_REGEX.test(upiId)) return res.status(400).json({ message: "Enter a valid UPI ID." });
    const wallet = await Wallet.findOneAndUpdate(
      { user: req.user._id, availableBalance: { $gte: amount } },
      { $inc: { availableBalance: -amount, pendingBalance: amount } },
      { new: true }
    );
    if (!wallet) return res.status(400).json({ message: "Insufficient available balance." });
    try {
      const withdrawal = await Withdrawal.create({ user: req.user._id, amount, upiId });
      await WalletTransaction.create({ user: req.user._id, type: "DEBIT", category: "WITHDRAWAL", amount, withdrawal: withdrawal._id, status: "PENDING", description: "Withdrawal request" });
      res.status(201).json({ withdrawal: { ...withdrawal.toObject(), upiId: maskUpi(upiId) } });
    } catch (error) {
      await Wallet.findOneAndUpdate({ user: req.user._id }, { $inc: { availableBalance: amount, pendingBalance: -amount } });
      throw error;
    }
  } catch (error) { next(error); }
};

export const adminShareEarnOverview = async (req, res, next) => {
  try {
    const [rewards, withdrawals, links, activeSharers] = await Promise.all([
      WalletTransaction.aggregate([{ $match: { category: "SHARE_EARN" } }, { $group: { _id: "$status", amount: { $sum: "$amount" } } }]),
      Withdrawal.aggregate([{ $group: { _id: "$status", amount: { $sum: "$amount" } } }]),
      ShareLink.countDocuments(), ShareLink.distinct("owner")
    ]);
    res.json({ rewards, withdrawals, totalLinks: links, activeSharers: activeSharers.length });
  } catch (error) { next(error); }
};

export const adminListWithdrawals = async (req, res, next) => {
  try { res.json({ withdrawals: await Withdrawal.find().populate("user", "fullName email").sort({ createdAt: -1 }).limit(100) }); } catch (error) { next(error); }
};

export const adminListRewards = async (req, res, next) => {
  try {
    const rewards = await WalletTransaction.find({ category: "SHARE_EARN" })
      .populate("user", "fullName email")
      .populate("referredUser", "fullName email")
      .populate("internship", "title")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ rewards });
  } catch (error) { next(error); }
};

export const adminUpdateWithdrawal = async (req, res, next) => {
  try {
    const { status, transactionReference, adminNote } = req.body;
    if (!["PROCESSING", "COMPLETED", "REJECTED", "FAILED"].includes(status)) return res.status(400).json({ message: "Invalid withdrawal status" });
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });
    if (["COMPLETED", "REJECTED", "FAILED"].includes(withdrawal.status)) return res.status(400).json({ message: "This withdrawal has already been finalized" });
    withdrawal.status = status; withdrawal.transactionReference = transactionReference || withdrawal.transactionReference; withdrawal.adminNote = adminNote || withdrawal.adminNote;
    if (["COMPLETED", "REJECTED", "FAILED"].includes(status)) { withdrawal.processedAt = new Date(); withdrawal.processedBy = req.user._id; }
    await withdrawal.save();
    if (status === "COMPLETED") {
      await Promise.all([Wallet.findOneAndUpdate({ user: withdrawal.user }, { $inc: { pendingBalance: -withdrawal.amount, totalWithdrawn: withdrawal.amount } }), WalletTransaction.findOneAndUpdate({ withdrawal: withdrawal._id }, { status: "COMPLETED" })]);
    }
    if (["REJECTED", "FAILED"].includes(status)) {
      await Promise.all([Wallet.findOneAndUpdate({ user: withdrawal.user }, { $inc: { pendingBalance: -withdrawal.amount, availableBalance: withdrawal.amount } }), WalletTransaction.findOneAndUpdate({ withdrawal: withdrawal._id }, { status: "REVERSED" })]);
    }
    res.json({ withdrawal });
  } catch (error) { next(error); }
};
