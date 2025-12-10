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
    // Counts
    const hardwareCount = await HardwareAsset.countDocuments();
    const softwareCount = await SoftwareAsset.countDocuments();
    const coreLicensesCount = await CoreCompanyLicense.countDocuments();
    const activeLicenses = await CoreCompanyLicense.countDocuments({ status: "Active" });
    const expiredLicenses = await CoreCompanyLicense.countDocuments({ status: "Expired" });
    const usersCount = await User.countDocuments();

    // 💰 HARDWARE VALUATION
    const hardwareValuationAgg = await HardwareAsset.aggregate([
      {
        $project: {
          total: { $multiply: ["$assetCost", "$assetQuantity"] }
        }
      },
      { $group: { _id: null, sum: { $sum: "$total" } } }
    ]);

    const hardwareValuation = hardwareValuationAgg[0]?.sum || 0;

    // 💰 SOFTWARE VALUATION → USE costPerUnit × totalLicenses
    const softwareValuationAgg = await SoftwareAsset.aggregate([
      {
        $project: {
          total: {
            $cond: {
              if: { $gt: ["$costPerUnit", 0] },
              then: { $multiply: ["$costPerUnit", "$totalLicenses"] },
              else: "$totalCost"
            }
          }
        }
      },
      { $group: { _id: null, sum: { $sum: "$total" } } }
    ]);

    const softwareValuation = softwareValuationAgg[0]?.sum || 0;

    const totalValuation = hardwareValuation + softwareValuation;

    // 📈 Monthly growth % calculation for hardware
    const today = new Date();
    const thisMonth = today.getMonth() + 1;
    const thisYear = today.getFullYear();

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = lastMonthDate.getMonth() + 1;
    const lastYear = lastMonthDate.getFullYear();

    const monthlyValuationAgg = await HardwareAsset.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          total: { $multiply: ["$assetCost", "$assetQuantity"] }
        }
      }
    ]);

    const thisMonthValuation = monthlyValuationAgg
      .filter(v => v.month === thisMonth && v.year === thisYear)
      .reduce((sum, v) => sum + v.total, 0);

    const lastMonthValuation = monthlyValuationAgg
      .filter(v => v.month === lastMonth && v.year === lastYear)
      .reduce((sum, v) => sum + v.total, 0);

    let monthlyGrowthPercent = 0;
    if (lastMonthValuation > 0) {
      monthlyGrowthPercent = (
        ((thisMonthValuation - lastMonthValuation) / lastMonthValuation) * 100
      ).toFixed(2);
    }

    res.json({
      hardwareCount,
      softwareCount,
      coreLicensesCount,
      activeLicenses,
      expiredLicenses,
      usersCount,

      hardwareValuation,
      softwareValuation,
      totalValuation,
      monthlyGrowthPercent
    });

  } catch (error) {
    console.error(error);
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

    // Hardware
    const expiringHardware = await HardwareAsset.find(
      { DOE: { $gte: today, $lte: threeMonthsLater } },
      { _id: 1, DOE: 1, hardwareName: 1 }
    ).lean();

    // Software → FIXED: return `name`
    const expiringSoftware = await SoftwareAsset.find(
      { licenseExpiry: { $gte: today, $lte: threeMonthsLater } },
      { _id: 1, licenseExpiry: 1, name: 1 }
    ).lean();

    const formattedHardware = expiringHardware.map(h => ({
      _id: h._id,
      name: h.hardwareName,
      expiry: h.DOE,
      type: "Hardware"
    }));

    const formattedSoftware = expiringSoftware.map(s => ({
      _id: s._id,
      name: s.name,          // FIXED
      expiry: s.licenseExpiry,
      type: "Software"
    }));

    res.json({
      expiringHardware: formattedHardware,
      expiringSoftware: formattedSoftware
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

// 📈 Monthly Hardware Valuation (last 12 months)
router.get("/valuation-trend", authenticateToken(["super-admin", "admin"]), async (req, res) => {
  try {
    const valuation = await HardwareAsset.aggregate([
      {
        $addFields: {
          totalCost: {
            $multiply: ["$assetCost", "$assetQuantity"]
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          monthlyValuation: { $sum: "$totalCost" },
          assetsAdded: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json(valuation);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch valuation trend" });
  }
});

module.exports = router;
