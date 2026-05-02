// utils/currencyService.js
const axios = require("axios");

const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

let cachedRates = null;
let lastFetched = null;

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const getRates = async () => {
  const now = Date.now();

  // ✅ return cached if fresh
  if (cachedRates && now - lastFetched < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const res = await axios.get(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/INR`
    );

    if (res.data.result !== "success") {
      throw new Error("Failed to fetch rates");
    }

    cachedRates = res.data.conversion_rates;
    lastFetched = now;

    return cachedRates;
  } catch (err) {
    console.error("Currency API Error:", err.message);

    // fallback (important)
    if (cachedRates) return cachedRates;

    throw err;
  }
};

module.exports = { getRates };