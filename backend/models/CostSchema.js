// shared/costSchema.js (optional but recommended)
const mongoose = require("mongoose");
const SUPPORTED_CURRENCIES = [
  "INR", "USD", "EUR", "GBP", "JPY",
  "AUD", "CAD", "CHF",
  "CNY", "HKD", "SGD",
  "AED", "SAR", "QAR", "KWD",
  "SEK", "NZD"
];
const costSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true, // ISO 4217 (INR, USD, EUR)
      enum: SUPPORTED_CURRENCIES, // 🔒 validation
    },
    baseAmount: {
      type: Number,
      required: true,
      min: 0, // converted to base currency
    },
  },
  { _id: false }
);

module.exports = costSchema;
