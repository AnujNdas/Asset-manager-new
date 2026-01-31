// shared/costSchema.js
const mongoose = require("mongoose");

const SUPPORTED_CURRENCIES = [
  "INR","USD","EUR","GBP","JPY",
  "AUD","CAD","CHF","CNY","HKD","SGD",
  "AED","SAR","QAR","KWD","SEK","NZD"
];

const costSchema = new mongoose.Schema(
  {
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    unitAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      enum: SUPPORTED_CURRENCIES,
    },

    baseTotalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

module.exports = costSchema;
