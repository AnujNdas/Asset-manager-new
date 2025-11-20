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
    const hardwareCount = await HardwareAsset.countDocuments();
    const softwareCount = await SoftwareAsset.countDocuments();
    const categoryCount = await Category.countDocuments();
    const locationCount = await Location.countDocuments();

    const recentHardware = await HardwareAsset.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentSoftware = await SoftwareAsset.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // ---------------------------------------
    // 🔥 EXPIRY SYSTEM
    // ---------------------------------------
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    // --- SOFTWARE EXPIRY ---
    const expiredSoftware = await SoftwareAsset.find({
      licenseExpiry: { $lt: today },
    });

    const expiringSoonSoftware = await SoftwareAsset.find({
      licenseExpiry: { $gte: today, $lte: next30Days }
    });

    // --- HARDWARE EXPIRY (if you have warrantyExpiry field) ---
    const expiredHardware = await HardwareAsset.find({
      warrantyExpiry: { $lt: today }
    });

    const expiringSoonHardware = await HardwareAsset.find({
      warrantyExpiry: { $gte: today, $lte: next30Days }
    });

    res.json({
      hardwareCount,
      softwareCount,
      categoryCount,
      locationCount,
      recentHardware,
      recentSoftware,

      // ADD NEW FIELD
      expiry: {
        expired: [...expiredHardware, ...expiredSoftware],
        expiringSoon: [...expiringSoonHardware, ...expiringSoonSoftware],
      }
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

module.exports = router;
