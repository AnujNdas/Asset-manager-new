const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
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
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

/* ================= NORMALIZE NAME ================= */
locationSchema.pre("validate", function (next) {
  if (this.name) {
    this.name =
      this.name.charAt(0).toUpperCase() +
      this.name.slice(1).toLowerCase();
  }
  next();
});

/* ================= UNIQUE PER ORGANIZATION (ACTIVE ONLY) ================= */
locationSchema.index(
  { organizationId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

module.exports = mongoose.model("Location", locationSchema);
