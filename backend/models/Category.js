// models/category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    }
  },
  { timestamps: true }
);

// Normalize before validation
categorySchema.pre("validate", function (next) {
  if (this.name) {
    this.name =
      this.name.charAt(0).toUpperCase() +
      this.name.slice(1).toLowerCase();
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
