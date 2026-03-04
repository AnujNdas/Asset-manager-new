// currencyService.js

const FX_URL = "https://open.er-api.com/v6/latest/INR";
const CACHE_KEY = "fx_rates_v1";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const fetchRatesFromAPI = async () => {
  const res = await fetch(FX_URL);
  const data = await res.json();

  if (data.result !== "success") {
    throw new Error("Failed to fetch exchange rates");
  }

  return data.rates; // Base = INR
};

export const getRates = async () => {
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    const parsed = JSON.parse(cached);

    if (Date.now() - parsed.timestamp < CACHE_DURATION) {
      return parsed.rates;
    }
  }

  const rates = await fetchRatesFromAPI();

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      rates,
      timestamp: Date.now()
    })
  );

  return rates;
};