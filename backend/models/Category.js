const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
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
categorySchema.pre("validate", function (next) {
  if (this.name) {
    this.name =
      this.name.charAt(0).toUpperCase() +
      this.name.slice(1).toLowerCase();
  }
  next();
});

/* ================= UNIQUE ACTIVE CATEGORY ================= */
/**
 * Ensures:
 * - Only ONE active category per name
 * - Allows re-creating a category if the old one is inactive
 */
categorySchema.index(
  { name: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

module.exports = mongoose.model("Category", categorySchema);
