const RATES = {
  INR: 1,
  USD: 83,
  EUR: 90,
  GBP: 104
};

export const convertFromBase = (baseAmount, targetCurrency) => {
  if (!baseAmount) return 0;
  return +(baseAmount / RATES[targetCurrency]).toFixed(2);
};
