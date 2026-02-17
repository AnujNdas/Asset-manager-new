const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    employeeCode: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true
    },

    phone: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

/**
 * Prevent duplicate employee codes inside same organization
 */
employeeSchema.index(
  { organizationId: 1, employeeCode: 1 },
  { unique: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
