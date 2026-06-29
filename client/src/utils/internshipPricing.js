export const MINIMUM_FOUR_WEEK_PRICE = 9;

const DEFAULT_DURATION_PRICING = {
  "4-weeks": MINIMUM_FOUR_WEEK_PRICE,
  "3-months": 1499,
  "6-months": 2499
};

export const getEffectiveDurationPrice = (duration) => {
  const price = Number(duration?.price || 0);
  const defaultPrice = DEFAULT_DURATION_PRICING[duration?.key] || 0;
  return Math.max(price, defaultPrice);
};

export const isPaidDuration = (duration) =>
  Boolean(duration?.isPaid) || getEffectiveDurationPrice(duration) > 0;

export const getDurationPriceLabel = (duration) => {
  if (!duration) return "Flexible";

  if (!isPaidDuration(duration)) {
    return "Free";
  }

  const price = getEffectiveDurationPrice(duration);
  return price > 0 ? `Rs ${price}` : "Paid";
};
