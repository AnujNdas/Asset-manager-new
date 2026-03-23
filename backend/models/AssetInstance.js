const mongoose = require("mongoose");

const assetInstanceSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },

    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "assetTypeRef"
    },

    assetTypeRef: {
      type: String,
      required: true,
      enum: ["Asset", "SoftwareAsset"]
    },

    assetType: {
      type: String,
      enum: ["hardware", "software"],
      required: true
    },

    instanceCode: {
      type: String,
      required: true
    },

    uniqueIdentifier: {
      type: String,
      trim: true,
      sparse: true
    },

    status: {
      type: String,
      enum: ["in_stock", "assigned", "under_repair", "retired", "lost"],
      default: "in_stock",
      index: true
    },

    assignedTo: {
      employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
      },
      departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
      },
      assignedAt: Date
    },
    condition: {
        type: String,
        enum: ["new", "used", "damaged"],
        default: "new"
      },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location"
    },

    lifecycle: [
      {
        action: String,
        date: { type: Date, default: Date.now },
        notes: String
      }
    ],

    warranty: {
      expiryDate: Date,
      status: {
        type: String,
        enum: ["active", "expired"],
        default: "active"
      }
    },

    hardwareDetails: {
      modelNo: String
    },

    softwareDetails: {
      expiryDate: Date,
      seats: Number
    },

    meta: mongoose.Schema.Types.Mixed,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// 🔥 Ensure unique instanceCode per org
assetInstanceSchema.index(
  { organizationId: 1, instanceCode: 1 },
  { unique: true }
);
assetInstanceSchema.index(
  { organizationId: 1, uniqueIdentifier: 1 },
  { unique: true, sparse: true }
);
// 🔥 Fast lookup for assignments
assetInstanceSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model("AssetInstance", assetInstanceSchema);