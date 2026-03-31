import { ReferralCode } from "../models/ReferralCode.js";

const normalizeReferralCode = (value) =>
  String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 16);

const generateReferralCode = (ownerName) => {
  const prefix = String(ownerName || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6) || "NAVYAN";
  const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(2, 6);
  return `${prefix}${suffix}`.slice(0, 16);
};

export const listReferralCodes = async (req, res, next) => {
  try {
    const codes = await ReferralCode.find().sort({ isDeleted: 1, createdAt: -1 });
    res.json({ codes });
  } catch (err) {
    next(err);
  }
};

export const createReferralCode = async (req, res, next) => {
  try {
    const ownerName = String(req.body?.ownerName || "").trim();
    const requestedCode = normalizeReferralCode(req.body?.code);

    if (!ownerName) {
      return res.status(400).json({ message: "Owner name is required." });
    }

    let code = requestedCode || generateReferralCode(ownerName);

    while (await ReferralCode.exists({ code })) {
      code = generateReferralCode(ownerName);
    }

    const referralCode = await ReferralCode.create({
      ownerName,
      code,
      createdBy: req.user?._id
    });

    res.status(201).json({ referralCode });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: "This referral code already exists." });
    }
    next(err);
  }
};

export const deleteReferralCode = async (req, res, next) => {
  try {
    const referralCode = await ReferralCode.findById(req.params.id);
    if (!referralCode || referralCode.isDeleted) {
      return res.status(404).json({ message: "Referral code not found." });
    }

    referralCode.isActive = false;
    referralCode.isDeleted = true;
    referralCode.deletedAt = new Date();
    await referralCode.save();

    res.json({ message: "Referral code deleted." });
  } catch (err) {
    next(err);
  }
};

export const findActiveReferralCodeByValue = async (code) => {
  const normalizedCode = normalizeReferralCode(code);

  if (!normalizedCode) {
    return null;
  }

  return ReferralCode.findOne({
    code: normalizedCode,
    isActive: true,
    isDeleted: false
  });
};

export const incrementReferralUsage = async (id) => {
  if (!id) return;

  await ReferralCode.findByIdAndUpdate(id, {
    $inc: {
      usageCount: 1
    }
  });
};
