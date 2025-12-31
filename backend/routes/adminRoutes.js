// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const HardwareAsset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const CoreCompanyLicense = require("../models/CoreCompanyLicense");
const User = require("../models/User");
const authenticateToken = require("../Middleware/Authentication-token"); // ✅ use your middleware

// 📊 GET /api/admin/stats (super-admin & admin can see stats)
router.get(
  "/stats",
  authenticateToken(["super-admin", "admin"]),
  async (req, res) => {
    try {
      // Counts
      const hardwareCount = await HardwareAsset.countDocuments();
      const softwareCount = await SoftwareAsset.countDocuments();
      const coreLicensesCount = await CoreCompanyLicense.countDocuments();
      const activeLicenses = await CoreCompanyLicense.countDocuments({ status: "Active" });
      const expiredLicenses = await CoreCompanyLicense.countDocuments({ status: "Expired" });
      const usersCount = await User.countDocuments();

      // 💰 Hardware valuation
const hardwareValuationAgg = await HardwareAsset.aggregate([
  {
    $project: {
      total: {
        $multiply: [
          { $ifNull: ["$assetCost.baseAmount", 0] },
          { $ifNull: ["$assetQuantity", 0] }
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      sum: { $sum: "$total" }
    }
  }
]);

const hardwareValuation = hardwareValuationAgg[0]?.sum || 0;


      // 💰 Software valuation
const softwareValuationAgg = await SoftwareAsset.aggregate([
  {
    $project: {
      total: {
        $multiply: [
          { $ifNull: ["$assetCost.baseAmount", 0] },
          { $ifNull: ["$assetQuantity", 0] }
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      sum: { $sum: "$total" }
    }
  }
]);

const softwareValuation = softwareValuationAgg[0]?.sum || 0;



      const totalValuation = hardwareValuation + softwareValuation;

      // 📈 Monthly growth
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
      total: {
        $multiply: [
          { $ifNull: ["$assetCost.baseAmount", 0] },
          { $ifNull: ["$assetQuantity", 0] }
        ]
      }
    }
  }
]);



      const thisMonthValuation = monthlyValuationAgg
        .filter(v => v.month === thisMonth && v.year === thisYear)
        .reduce((sum, v) => sum + v.total, 0);

      const lastMonthValuation = monthlyValuationAgg
        .filter(v => v.month === lastMonth && v.year === lastYear)
        .reduce((sum, v) => sum + v.total, 0);

      const monthlyGrowthPercent =
        lastMonthValuation > 0
          ? (((thisMonthValuation - lastMonthValuation) / lastMonthValuation) * 100).toFixed(2)
          : 0;

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
        monthlyGrowthPercent,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  }
);

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

    // HARDWARE AGGREGATION
const hardwareValuation = await HardwareAsset.aggregate([
  {
    $addFields: {
      normalizedCost: {
        $cond: [
          { $eq: [{ $type: "$assetCost" }, "object"] },
          "$assetCost.baseAmount",
          {
            $cond: [{ $isNumber: "$assetCost" }, "$assetCost", 0]
          }
        ]
      }
    }
  },
  {
    $addFields: {
      totalCost: {
        $multiply: ["$normalizedCost", { $ifNull: ["$assetQuantity", 0] }]
      }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      hardwareValuation: { $sum: "$totalCost" },
      hardwareCount: { $sum: 1 }
    }
  }
]);


    // SOFTWARE AGGREGATION
const softwareValuation = await SoftwareAsset.aggregate([
  {
    $addFields: {
      normalizedCost: {
        $cond: [
          { $eq: [{ $type: "$assetCost" }, "object"] },
          "$assetCost.baseAmount",
          {
            $cond: [{ $isNumber: "$assetCost" }, "$assetCost", 0]
          }
        ]
      }
    }
  },
  {
    $addFields: {
      totalCost: {
        $multiply: ["$normalizedCost", { $ifNull: ["$assetQuantity", 0] }]
      }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      softwareValuation: { $sum: "$totalCost" },
      softwareCount: { $sum: 1 }
    }
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } }
]);


    // MERGE HARDWARE + SOFTWARE
    const trendMap = new Map();

    // Place hardware data
    hardwareValuation.forEach(h => {
      const key = `${h._id.year}-${h._id.month}`;
      trendMap.set(key, {
        year: h._id.year,
        month: h._id.month,
        hardwareValuation: h.hardwareValuation || 0,
        softwareValuation: 0,
        totalValuation: h.hardwareValuation || 0,
        hardwareCount: h.hardwareCount || 0,
        softwareCount: 0
      });
    });

    // Place or merge software data
    softwareValuation.forEach(s => {
      const key = `${s._id.year}-${s._id.month}`;
      const existing = trendMap.get(key);

      if (existing) {
        existing.softwareValuation = s.softwareValuation || 0;
        existing.totalValuation =
          existing.hardwareValuation + (s.softwareValuation || 0);
        existing.softwareCount = s.softwareCount || 0;
      } else {
        trendMap.set(key, {
          year: s._id.year,
          month: s._id.month,
          hardwareValuation: 0,
          softwareValuation: s.softwareValuation || 0,
          totalValuation: s.softwareValuation || 0,
          hardwareCount: 0,
          softwareCount: s.softwareCount || 0
        });
      }
    });

    // SORT
    const finalTrend = Array.from(trendMap.values()).sort((a, b) => {
      if (a.year === b.year) return a.month - b.month;
      return a.year - b.year;
    });

    // FORMAT FOR CHARTS
    const labels = finalTrend.map(v => `${String(v.month).padStart(2, "0")}/${v.year}`);
    const hardwareValuationArr = finalTrend.map(v => v.hardwareValuation);
    const softwareValuationArr = finalTrend.map(v => v.softwareValuation);
    const totalValuationArr = finalTrend.map(v => v.totalValuation);
    const hardwareCountArr = finalTrend.map(v => v.hardwareCount);
    const softwareCountArr = finalTrend.map(v => v.softwareCount);

    return res.json({
      labels,
      hardwareValuation: hardwareValuationArr,
      softwareValuation: softwareValuationArr,
      totalValuation: totalValuationArr,
      hardwareCount: hardwareCountArr,
      softwareCount: softwareCountArr
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch valuation trend" });
  }
});


module.exports = router;
