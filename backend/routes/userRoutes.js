// routes/userDashboardRoute.js
const express = require("express");
const router = express.Router();

const HardwareAsset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const Category = require("../models/Category");
const Location = require("../models/Location");

const authenticateToken = require("../Middleware/Authentication-token");

// 📊 GET /api/user/dashboard
router.get("/dashboard", authenticateToken(), async (req, res) => {
  try {
    // Counts
    const hardwareCount = await HardwareAsset.countDocuments();
    const softwareCount = await SoftwareAsset.countDocuments();
    const categoryCount = await Category.countDocuments();
    const locationCount = await Location.countDocuments();

    // Recent hardware assets (limit 5)
    const recentHardware = await HardwareAsset.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent software assets (limit 5)
    const recentSoftware = await SoftwareAsset.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      hardwareCount,
      softwareCount,
      categoryCount,
      locationCount,
      recentHardware,
      recentSoftware,
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

module.exports = router;
