export const MINIMUM_FOUR_WEEK_PRICE = 49;

const DEFAULT_DURATION_PRICING = {
  "4-weeks": 49,
  "3-months": 2499,
  "6-months": 4499
};

export const getEffectiveDurationPrice = (duration) => {
  if (!duration) return 0;
  return typeof duration.price === "number" ? duration.price : (DEFAULT_DURATION_PRICING[duration.key] || 0);
};

export const isPaidDuration = (duration) => {
  if (!duration) return false;
  return Boolean(duration.isPaid) || getEffectiveDurationPrice(duration) > 0;
};

export const getDurationPriceLabel = (duration) => {
  if (!isPaidDuration(duration)) {
    return "Free";
  }

  return `Rs ${getEffectiveDurationPrice(duration).toLocaleString("en-IN")}`;
};
