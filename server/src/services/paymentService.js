import QRCode from "qrcode";

const DEFAULT_PRICING = {
  "4-weeks": 0,
  "3-months": 1499,
  "6-months": 2499
};

export const getDurationPricing = (internship, durationKey) => {
  const duration = internship?.durations?.find((item) => item.key === durationKey);
  if (!duration) {
    return { duration: null, amount: 0, isPaid: false };
  }

  const amount =
    typeof duration.price === "number" && duration.price > 0
      ? duration.price
      : DEFAULT_PRICING[durationKey] || 0;

  return {
    duration,
    amount,
    isPaid: duration.isPaid || amount > 0
  };
};

export const buildUpiPaymentPayload = async ({
  upiId,
  amount,
  paymentReference,
  payeeName = "Navyan",
  note = "Navyan internship payment"
}) => {
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&tr=${encodeURIComponent(paymentReference)}&tn=${encodeURIComponent(
    `${note} ${paymentReference}`
  )}&am=${amount.toFixed(2)}&cu=INR`;

  const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
    margin: 1,
    width: 280
  });

  return { upiUrl, qrCodeDataUrl };
};
