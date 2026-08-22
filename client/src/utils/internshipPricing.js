export const MINIMUM_FOUR_WEEK_PRICE = 0;

const DEFAULT_DURATION_PRICING = {
  "4-weeks": 0,
  "3-months": 0,
  "6-months": 0
};

export const getEffectiveDurationPrice = (duration) => {
  return 0;
};

export const isPaidDuration = (duration) => false;

export const getDurationPriceLabel = (duration) => {
  return "Free";
};
