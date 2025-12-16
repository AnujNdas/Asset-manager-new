// models/unit.js
const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

/* ================= NORMALIZE NAME ================= */
unitSchema.pre("validate", function (next) {
  if (this.name) {
    this.name =
      this.name.charAt(0).toUpperCase() +
      this.name.slice(1).toLowerCase();
  }
  next();
});

/* ================= UNIQUE ACTIVE UNIT ================= */
unitSchema.index(
  { name: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

module.exports = mongoose.model("Unit", unitSchema);
