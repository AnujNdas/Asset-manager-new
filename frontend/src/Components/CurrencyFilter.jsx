import { useCurrency } from "../Context/CurrencyContext";
import "../Component_styles/CurrencyFilter.css";
const currencies = ["INR", "USD", "EUR", "GBP"];

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
