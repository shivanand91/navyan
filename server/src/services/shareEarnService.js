import { Wallet } from "../models/Wallet.js";
import { WalletTransaction } from "../models/WalletTransaction.js";
import { ShareAttribution } from "../models/ShareAttribution.js";
import { ShareLink } from "../models/ShareLink.js";

const rewardByDuration = { "4-weeks": 10, "3-months": 50, "6-months": 100 };

export const getShareReward = (durationKey) => rewardByDuration[durationKey] || 0;

export const creditShareRewardForApplication = async (application) => {
  // A UTR submission is not proof of payment. Paid applications must be verified by admin first.
  const paymentStatus = application.payment?.status || "Not Required";
  const isPaymentEligible = paymentStatus === "Not Required" || ["Verified", "Linked"].includes(paymentStatus);
  if (!isPaymentEligible || application.status !== "Selected") return null;

  const attribution = application.shareAttribution
    ? await ShareAttribution.findById(application.shareAttribution)
    : null;
  if (!attribution || attribution.status !== "ATTRIBUTED" || attribution.expiresAt < new Date()) return null;
  if (String(attribution.owner) === String(application.user)) return null;

  const amount = getShareReward(application.durationKey);
  if (!amount) return null;

  try {
    const transaction = await WalletTransaction.create({
      user: attribution.owner,
      type: "CREDIT",
      category: "SHARE_EARN",
      amount,
      internship: application.internship,
      shareLink: attribution.shareLink,
      referredUser: application.user,
      status: "AVAILABLE",
      description: `Reward for successful ${application.durationKey.replace("-", " ")} internship enrollment`
    });

    await Wallet.findOneAndUpdate(
      { user: attribution.owner },
      { $setOnInsert: { user: attribution.owner }, $inc: { availableBalance: amount, totalEarned: amount } },
      { upsert: true, new: true }
    );
    await Promise.all([
      ShareAttribution.findByIdAndUpdate(attribution._id, { status: "CONVERTED" }),
      ShareLink.findByIdAndUpdate(attribution.shareLink, { $inc: { conversions: 1 } })
    ]);
    return transaction;
  } catch (error) {
    if (error?.code === 11000) return null;
    throw error;
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
