// routes/instanceRoutes.js

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
// 🔐 Middlewares
const authenticateToken = require("../Middleware/Authentication-token");
const tenantMiddleware = require("../Middleware/tenantMiddleware");
const requireActiveSubscription = require("../Middleware/requireActiveSubscription");

// 📦 Models (YES — REQUIRED)
const Asset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const AssetInstance = require("../models/AssetInstance");

// 🔐 Apply middleware to all routes
router.use(
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  requireActiveSubscription
);

// =======================================================
// 🔥 GET PENDING INSTANCE ASSETS (Hardware + Software)
// =======================================================
const getPendingInstances = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { type = "all" } = req.query;

    // =========================
    // 🔹 1. INSTANCE COUNT MAP
    // =========================

const instanceCounts = await AssetInstance.aggregate([
  {
    $match: {
      organizationId: new mongoose.Types.ObjectId(organizationId)
    }
  },
  {
    $group: {
      _id: { $toString: "$assetId" },
      count: { $sum: 1 }
    }
  }
]);

    const instanceMap = {};
    instanceCounts.forEach(i => {
      instanceMap[String(i._id)] = i.count;
    });
    console.log("INSTANCE COUNTS:", instanceCounts);
    console.log("MAP:", instanceMap);
    let hardware = [];
    let software = [];

    // =========================
    // 🔹 2. HARDWARE ASSETS
    // =========================
    if (type === "all" || type === "hardware") {
      const assets = await Asset.find({ organizationId })
        .select("assetName assetCode assetQuantity assetCategory createdAt")
        .populate("assetCategory", "name")
        .lean();

      hardware = assets.map(a => {
        const count = instanceMap[String(a._id)] || 0;

        return {
          ...a,
          assetType: "hardware",
          instanceCount: count,
          pendingCount: a.assetQuantity - count
        };
      });
    }

    // =========================
    // 🔹 3. SOFTWARE ASSETS
    // =========================
    if (type === "all" || type === "software") {
      const assets = await SoftwareAsset.find({ organizationId })
        .select("assetName assetCode assetQuantity assetCategory createdAt")
        .populate("assetCategory", "name")
        .lean();

      software = assets.map(a => {
        const count = instanceMap[String(a._id)] || 0;

        return {
          ...a,
          assetType: "software",
          instanceCount: count,
          pendingCount: a.assetQuantity - count
        };
      });
    }

    // =========================
    // 🔥 4. MERGE + FILTER
    // =========================
    let result = [...hardware, ...software];

    // Only assets with pending instances
    result = result.filter(a => a.instanceCount < a.assetQuantity);

    // =========================
    // 🔥 5. SORT (BEST PRACTICE)
    // =========================
    result.sort((a, b) =>
      a.assetName.localeCompare(b.assetName)
    );

    return res.status(200).json(result);

  } catch (err) {
    console.error("GET PENDING INSTANCES ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch pending instances"
    });
  }
};
const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(403).json({
        message: "Organization context missing",
      });
    }

    // 🔥 Try hardware first
    let asset = await Asset.findOne({
      _id: id,
      organizationId
    })
      .populate("assetCategory", "name")
      .populate("locationName", "name")
      .lean();

    let assetType = "hardware";

    // 🔥 If not found → try software
    if (!asset) {
      asset = await SoftwareAsset.findOne({
        _id: id,
        organizationId
      })
        .populate("assetCategory", "name")
        .populate("locationName", "name")
        .lean();

      assetType = "software";
    }

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    // 🔥 Instance count (shared collection)
    const instanceCount = await AssetInstance.countDocuments({
      assetId: id,
      organizationId
    });

    const pendingInstances =
      asset.assetQuantity - instanceCount;

    return res.status(200).json({
      ...asset,
      assetType,
      instanceCount,
      pendingInstances
    });

  } catch (error) {
    console.error("🔥 GET ASSET BY ID ERROR:", error);
    return next(error);
  }
};
// =======================================================
// 🔌 ROUTES
// =======================================================
router.get("/pending", getPendingInstances);
router.get("/:id", getAssetById);

module.exports = router;