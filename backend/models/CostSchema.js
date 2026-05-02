const mongoose = require('mongoose')
const SUPPORTED_CURRENCIES = [
  "INR","USD","EUR","GBP","JPY",
  "AUD","CAD","CHF","CNY","HKD","SGD",
  "AED","SAR","QAR","KWD","SEK","NZD"
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
      enum: SUPPORTED_CURRENCIES,
    },

    baseAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    conversionRate: {
      type: Number,
      required: true,
    },

    convertedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);