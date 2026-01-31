export const RATES = {
  // Base
  INR: 1,

  // Major
  USD: 83,
  EUR: 90,
  GBP: 104,
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
  NZD: 51,
  SEK: 7.9
};

export const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "Fr.",
  CNY: "¥",
  HKD: "HK$",
  SGD: "S$",
  AED: "د.إ",
  SAR: "﷼",
  SEK: "kr",
  KWD: "KD",
  QAR: "QR",
  NZD: "NZ$"
};
export const convertFromBase = (amount, targetCurrency = "USD") => {
  if (!amount || !RATES[targetCurrency]) return 0;

  const amountInINR = amount * RATES.USD;
  return +(amountInINR / RATES[targetCurrency]).toFixed(2);
};
