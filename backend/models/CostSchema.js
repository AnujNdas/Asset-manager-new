const mongoose = require("mongoose");

const costSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    currency: {
      type: String,
      uppercase: true,
      enum: ["USD"],
      default: "USD"
    }
  },
  { _id: false }
);

module.exports = costSchema;