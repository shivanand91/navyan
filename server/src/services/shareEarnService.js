import mongoose from "mongoose";
import { Wallet } from "../models/Wallet.js";
import { WalletTransaction } from "../models/WalletTransaction.js";
import { ShareAttribution } from "../models/ShareAttribution.js";
import { ShareLink } from "../models/ShareLink.js";
import { Application } from "../models/Application.js";
import { Internship } from "../models/Internship.js";

const rewardByDuration = { "4-weeks": 10, "3-months": 50, "6-months": 100 };

const normalizeRewardKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getShareReward = (internship, durationKey) => {
  const duration = internship?.durations?.find((item) => item.key === durationKey);
  if (!duration) {
    return 0;
  }

  const candidateKeys = [
    normalizeRewardKey(duration.key),
    normalizeRewardKey(duration.label)
  ].filter(Boolean);

  for (const key of candidateKeys) {
    if (rewardByDuration[key]) {
      return rewardByDuration[key];
    }
  }

  return 0;
};

export const creditShareRewardForApplication = async (application) => {
  // A UTR submission is not proof of payment. Paid applications must be verified by admin first.
  const paymentStatus = application.payment?.status || "Not Required";
  const isPaymentEligible = paymentStatus === "Not Required" || ["Verified", "Linked"].includes(paymentStatus);
  if (!isPaymentEligible || application.status === "Rejected") return null;

  const attributionQuery = application.shareAttribution
    ? { _id: application.shareAttribution }
    : { referredUser: application.user, internship: application.internship, status: "ATTRIBUTED" };

  const internship =
    application.internship?.durations
      ? application.internship
      : await Internship.findById(application.internship).select("durations");
  const amount = getShareReward(internship, application.durationKey);
  if (!amount) return null;

  const session = await mongoose.startSession();

  try {
    let transaction = null;

    await session.withTransaction(async () => {
      const attribution = await ShareAttribution.findOne(attributionQuery).session(session);
      if (!attribution || attribution.status !== "ATTRIBUTED" || attribution.expiresAt < new Date()) {
        return;
      }
      if (String(attribution.owner) === String(application.user)) {
        return;
      }

      const existingReward = await WalletTransaction.findOne({
        user: attribution.owner,
        referredUser: application.user,
        internship: application.internship,
        category: "SHARE_EARN"
      }).session(session);
      if (existingReward) {
        transaction = existingReward;
        return;
      }

      [transaction] = await WalletTransaction.create(
        [
          {
            user: attribution.owner,
            type: "CREDIT",
            category: "SHARE_EARN",
            amount,
            internship: application.internship,
            shareLink: attribution.shareLink,
            referredUser: application.user,
            status: "AVAILABLE",
            description: `Reward for successful ${application.durationKey.replace(/-/g, " ")} internship enrollment`
          }
        ],
        { session }
      );

      await Wallet.updateOne(
        { user: attribution.owner },
        {
          $setOnInsert: { user: attribution.owner },
          $inc: { availableBalance: amount, totalEarned: amount }
        },
        { upsert: true, session }
      );

      const attributionUpdate = await ShareAttribution.updateOne(
        { _id: attribution._id, status: "ATTRIBUTED" },
        { $set: { status: "CONVERTED" } },
        { session }
      );

      if (attributionUpdate.modifiedCount > 0) {
        await ShareLink.updateOne(
          { _id: attribution.shareLink },
          { $inc: { conversions: 1 } },
          { session }
        );
      }
    });

    return transaction;
  } catch (error) {
    if (error?.code === 11000) {
      return WalletTransaction.findOne({
        referredUser: application.user,
        internship: application.internship,
        category: "SHARE_EARN"
      });
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

export const syncPendingShareRewards = async () => {
  try {
    const eligibleAttributions = await ShareAttribution.find({ status: "ATTRIBUTED" });
    for (const attr of eligibleAttributions) {
      const app = await Application.findOne({
        user: attr.referredUser,
        internship: attr.internship,
        status: { $ne: "Rejected" }
      });
      if (app) {
        await creditShareRewardForApplication(app);
      }
    }
  } catch (err) {
    console.error("Auto sync pending share rewards error:", err);
  }
};

export const reverseShareRewardForApplication = async (application) => {
  const reward = await WalletTransaction.findOne({
    category: "SHARE_EARN", referredUser: application.user, internship: application.internship, status: "AVAILABLE"
  });
  if (!reward) return null;

  const updated = await WalletTransaction.findOneAndUpdate(
    { _id: reward._id, status: "AVAILABLE" },
    { $set: { status: "REVERSED" } },
    { new: true }
  );
  if (!updated) return null;
  await Wallet.findOneAndUpdate({ user: reward.user, availableBalance: { $gte: reward.amount } }, { $inc: { availableBalance: -reward.amount } });
  return updated;
};
