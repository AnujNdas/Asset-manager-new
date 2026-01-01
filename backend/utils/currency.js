const BASE_CURRENCY = "INR";

// Temporary static rates (INR as base)
// NOTE: Values are approximate and can be updated later
const RATES = {
  // Base
  INR: 1,

  // Major
  USD: 83,
  EUR: 90,
  GBP: 105,
  JPY: 0.56,

  // Asia
  CNY: 11.5,
  HKD: 10.6,
  SGD: 61,
  AED: 22.6,
  SAR: 22.1,
  QAR: 22.8,
  KWD: 270,

  // Others
  AUD: 55,
  CAD: 61,
  CHF: 94,
  SEK: 7.9,
  NZD: 51
};

/**
 * Converts any supported currency → INR (base currency)
 */
const convertToBase = (amount, currency) => {
  if (amount == null || isNaN(amount)) return 0;

  const rate = RATES[currency];

  if (!rate) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  return Number((amount * rate).toFixed(2));
};

module.exports = {
  BASE_CURRENCY,
  RATES,
  convertToBase
};

