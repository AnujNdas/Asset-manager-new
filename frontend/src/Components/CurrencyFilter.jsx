import { useState, useRef, useEffect } from "react";
import { useCurrency } from "../Context/CurrencyContext";
import "../Component_styles/CurrencyFilter.css";

export const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  AUD: "A$",
  CAD: "C$",
  INR: "₹",
  CHF: "CHF",
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
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(
    currencies.indexOf(currency)
  );

  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!open && (e.key === "Enter" || e.key === " ")) {
      setOpen(true);
      return;
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev === currencies.length - 1 ? 0 : prev + 1
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev === 0 ? currencies.length - 1 : prev - 1
      );
    }

    if (e.key === "Enter") {
      setCurrency(currencies[focusedIndex]);
      setOpen(false);
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      className={`currency-dropdown ${open ? "open" : ""}`}
      ref={dropdownRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="combobox"
      aria-expanded={open}
    >
      <div
        className="currency-selected"
        onClick={() => setOpen((prev) => !prev)}
      >
        {CURRENCY_SYMBOLS[currency]} - {currency}
        <span className="dropdown-arrow" />
      </div>

      <ul className={`currency-menu ${open ? "show" : ""}`} role="listbox">
        {currencies.map((c, index) => (
          <li
            key={c}
            role="option"
            aria-selected={currency === c}
            className={`currency-option ${
              currency === c ? "selected" : ""
            } ${focusedIndex === index ? "focused" : ""}`}
            onClick={() => {
              setCurrency(c);
              setOpen(false);
            }}
            onMouseEnter={() => setFocusedIndex(index)}
          >
            {CURRENCY_SYMBOLS[c]} - {c}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CurrencyFilter;