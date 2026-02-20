import { useCurrency } from "../Context/CurrencyContext";
import "../Component_styles/CurrencyFilter.css";

export const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  CNY: "¥",
  HKD: "HK$",
  SGD: "S$",
  AED: "د.إ",
  SAR: "﷼",
  SEK: "kr",
  KWD: "د.ك",
  QAR: "ر.ق",
  NZD: "NZ$",
};

const currencies = Object.keys(CURRENCY_SYMBOLS);

const CurrencyFilter = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className="currency-filter"
    >
      {currencies.map((c) => (
        <option key={c} value={c}>
          {CURRENCY_SYMBOLS[c]}-{c}
        </option>
      ))}
    </select>
  );
};

export default CurrencyFilter;