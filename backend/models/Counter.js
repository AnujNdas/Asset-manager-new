// models/Counter.js

const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Organization",
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 🔥 Ensure unique counter per org + type
counterSchema.index({ name: 1, organizationId: 1 }, { unique: true });

module.exports = mongoose.model("Counter", counterSchema);