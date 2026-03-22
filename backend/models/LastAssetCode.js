const mongoose = require("mongoose");

const lastAssetCodeSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  key: {
    type: String,
    default: "hardwareAsset",
  },
  sequence: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true
});

// 🔥 Critical: one counter per org
lastAssetCodeSchema.index(
  { organizationId: 1, key: 1 },
  { unique: true }
);

module.exports = mongoose.model("LastAssetCode", lastAssetCodeSchema);