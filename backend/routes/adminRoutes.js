// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const HardwareAsset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const CoreCompanyLicense = require("../models/CoreCompanyLicense");
const User = require("../models/User");
const authenticateToken = require("../Middleware/Authentication-token"); // ✅ use your middleware

// 📊 GET /api/admin/stats (super-admin & admin can see stats)
router.get("/stats", authenticateToken(["super-admin", "admin"]), async (req, res) => {
  try {
    const hardwareCount = await HardwareAsset.countDocuments();
    const softwareCount = await SoftwareAsset.countDocuments();
    const coreLicensesCount = await CoreCompanyLicense.countDocuments();
    const activeLicenses = await CoreCompanyLicense.countDocuments({ status: "Active" });
    const expiredLicenses = await CoreCompanyLicense.countDocuments({ status: "Expired" });
    const usersCount = await User.countDocuments();

    res.json({
      hardwareCount,
      softwareCount,
      coreLicensesCount,
      activeLicenses,
      expiredLicenses,
      usersCount,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// 👥 GET all users (super-admin only)
router.get("/users", authenticateToken(["super-admin"]), async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // exclude password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ✏️ Update user role (super-admin only)
router.put("/users/:id/role", authenticateToken(["super-admin"]), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to update role" });
  }
});

// 📦 Top 5 Locations with Most Assets
router.get("/top-locations", authenticateToken(["super-admin", "admin"]), async (req, res) => {
  try {
    const hardwareLocations = await HardwareAsset.aggregate([
      { $group: { _id: "$locationName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json(hardwareLocations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top locations" });
  }
});
// ⏳ Assets Expiring in Next 3 Months
router.get("/expiring-assets", authenticateToken(["super-admin", "admin"]), async (req, res) => {
  try {
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    const expiringHardware = await HardwareAsset.find({
      DOE: { $gte: today, $lte: threeMonthsLater }
    });

    const expiringSoftware = await SoftwareAsset.find({
      licenseExpiry: { $gte: today, $lte: threeMonthsLater }
    });

    res.json({
      expiringHardware,
      expiringSoftware,
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expiring assets" });
  }
});
// ⏳ Assets Expiring in Next 3 Months
router.get("/expiring-assets", authenticateToken(["super-admin", "admin"]), async (req, res) => {
  try {
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    const expiringHardware = await HardwareAsset.find({
      DOE: { $gte: today, $lte: threeMonthsLater }
    });

    const expiringSoftware = await SoftwareAsset.find({
      licenseExpiry: { $gte: today, $lte: threeMonthsLater }
    });

    res.json({
      expiringHardware,
      expiringSoftware,
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expiring assets" });
  }
});
// 🆕 5 Most Recently Added Assets
router.get("/recent-assets", authenticateToken(["super-admin", "admin"]), async (req, res) => {
  try {
    const recentHardware = await HardwareAsset.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentSoftware = await SoftwareAsset.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      hardware: recentHardware,
      software: recentSoftware,
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recent assets" });
  }
});

router.get("/active-users", authenticateToken(["super-admin", "admin"]), async (req, res) => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const users = await User.find({
      lastActive: { $gte: cutoff }
    })
      .select("-password")
      .sort({ lastActive: -1 })
      .limit(5);

    res.json(users);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active users" });
  }
});


module.exports = router;
