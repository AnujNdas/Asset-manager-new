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
    },
        isSystem: {
      type: Boolean,
      default: false,
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    categoryType: {
  type: String,
  enum: ["hardware", "software"],
  required: true,
  index: true
},
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

/* ================= UNIQUE PER ORGANIZATION (ACTIVE ONLY) ================= */
categorySchema.index(
  { organizationId: 1, name: 1, categoryType: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

module.exports = mongoose.model("Category", categorySchema);
