import { createContext, useContext, useEffect, useState } from "react";
import { getRates } from "../Services/CurrencyServices";

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(
    localStorage.getItem("selected_currency") || "USD"
  );
  const [rates, setRates] = useState(null);
  const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    const loadRates = async () => {
      try {
        const fetchedRates = await getRates();
        setRates(fetchedRates);
      } catch (err) {
        console.error("Currency fetch failed:", err);
      } finally {
        setLoadingRates(false);
      }
    };

    loadRates();
  }, []);

  // persist selected currency
  useEffect(() => {
    localStorage.setItem("selected_currency", currency);
  }, [currency]);

  const convertFromBase = (amountInINR) => {
    if (!amountInINR) return 0;
    if (!rates) return 0;

    const rate = rates[currency];
    if (!rate) return amountInINR;

    return +(amountInINR * rate).toFixed(2);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        loadingRates,
        convertFromBase
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);