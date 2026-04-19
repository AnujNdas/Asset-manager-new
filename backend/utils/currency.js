const BASE_CURRENCY = "INR";

const RATES = {
  INR: 1,
  USD: 83,
  EUR: 90,
  GBP: 105,
  JPY: 0.56,
  CNY: 11.5,
  HKD: 10.6,
  SGD: 61,
  AED: 22.6,
  SAR: 22.1,
  QAR: 22.8,
  KWD: 270,
  AUD: 55,
  CAD: 61,
  CHF: 94,
  SEK: 7.9,
  NZD: 51
};

const convertToBase = (amount, currency, strict = false) => {
  if (amount == null || isNaN(amount)) return 0;

  const normalizedCurrency = currency?.toUpperCase();
  const rate = RATES[normalizedCurrency];

  if (!rate) {
    if (strict) {
      throw new Error(`Unsupported currency: ${currency}`);
    }
    console.warn(`Unsupported currency: ${currency}`);
    return 0;
  }

  return Number((amount * rate).toFixed(2));
};

const convertFromBase = (baseAmount, targetCurrency) => {
  if (!baseAmount) return 0;

  const rate = RATES[targetCurrency?.toUpperCase()];
  if (!rate) return 0;

  return Number((baseAmount / rate).toFixed(2));
};

module.exports = {
  BASE_CURRENCY,
  RATES,
  convertToBase,
  convertFromBase
};