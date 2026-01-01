import { useCurrency } from "../Context/CurrencyContext";

const currencies = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "HKD",
  "SGD",
  "AED",
  "SAR",
  "SEK",
  "KWD",
  "QAR",
  "NZD"
];

const CurrencyFilter = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className="currency-filter"
    >
      {currencies.map(c => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
};

export default CurrencyFilter;
