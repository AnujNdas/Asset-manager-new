const BASE_CURRENCY = "INR";

// Temporary static rates (replace later)
const RATES = {
  INR: 1,
  USD: 83,
  EUR: 90,
  GBP: 105,
};

const convertToBase = (amount, currency) => {
  const rate = RATES[currency];
  if (!rate) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
  return Number((amount * rate).toFixed(2));
};

module.exports = {
  BASE_CURRENCY,
  convertToBase,
};
