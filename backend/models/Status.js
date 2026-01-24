const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema(
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
      index: true,
    },
  },
  { timestamps: true }
);

/* ================= NORMALIZE NAME ================= */
statusSchema.pre("validate", function (next) {
  if (this.name) {
    this.name =
      this.name.charAt(0).toUpperCase() +
      this.name.slice(1).toLowerCase();
  }
  next();
});

/* ================= UNIQUE PER ORGANIZATION (ACTIVE ONLY) ================= */
statusSchema.index(
  { organizationId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

module.exports = mongoose.model("Status", statusSchema);
