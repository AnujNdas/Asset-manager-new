// utils/convertToBase.js
const { getRates } = require("./currencyService");

const convertToBase = async (amount, currency) => {
  if (currency === "INR") {
    return {
      baseAmount: amount,
      conversionRate: 1,
    };
  }

  const rates = await getRates();
  const rate = rates[currency];

  if (!rate) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  // 🔥 IMPORTANT: INR is base
  // API gives: 1 INR = rate (foreign)
  // so reverse:
  const baseAmount = +(amount / rate).toFixed(2);

  return {
    baseAmount,
    conversionRate: rate,
  };
};

module.exports = convertToBase;