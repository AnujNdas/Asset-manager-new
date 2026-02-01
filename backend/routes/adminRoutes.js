const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const HardwareAsset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const CoreCompanyLicense = require("../models/CoreCompanyLicense");
const User = require("../models/User");
const authenticateToken = require("../Middleware/Authentication-token");

/* ======================================================
   📊 STATS (WORKING – LEFT AS IS)
====================================================== */
router.get(
  "/stats",
  authenticateToken(["admin", "user"]),
  async (req, res) => {
    try {
      const organizationId = req.user.organizationId;

      const hardwareCount = await HardwareAsset.countDocuments({ organizationId });
      const softwareCount = await SoftwareAsset.countDocuments({ organizationId });
      const coreLicensesCount = await CoreCompanyLicense.countDocuments({ organizationId });
      const activeLicenses = await CoreCompanyLicense.countDocuments({
        organizationId,
        status: "Active",
      });
      const expiredLicenses = await CoreCompanyLicense.countDocuments({
        organizationId,
        status: "Expired",
      });
      const usersCount = await User.countDocuments({ organizationId });

      // Hardware valuation
      const hardwareValuationAgg = await HardwareAsset.aggregate([
        { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
        {
          $project: {
            total: {
              $multiply: [
                { $ifNull: ["$assetCost.baseAmount", 0] },
                { $ifNull: ["$assetQuantity", 1] },
              ],
            },
          },
        },
        { $group: { _id: null, sum: { $sum: "$total" } } },
      ]);

      const hardwareValuation = hardwareValuationAgg[0]?.sum || 0;

      // Software valuation
      const softwareValuationAgg = await SoftwareAsset.aggregate([
        { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
        {
          $project: {
            total: {
              $multiply: [
                { $ifNull: ["$assetCost.baseAmount", 0] },
                { $ifNull: ["$assetQuantity", 1] },
              ],
            },
          },
        },
        { $group: { _id: null, sum: { $sum: "$total" } } },
      ]);

      const softwareValuation = softwareValuationAgg[0]?.sum || 0;

      res.json({
        hardwareCount,
        softwareCount,
        coreLicensesCount,
        activeLicenses,
        expiredLicenses,
        usersCount,
        hardwareValuation,
        softwareValuation,
        totalValuation: hardwareValuation + softwareValuation,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  }
);
/* ======================================================
   📈 VALUATION TREND (FIXED)
====================================================== */
router.get("/valuation-trend", authenticateToken(["admin", "user"]), async (req, res) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);

    const hardware = await HardwareAsset.aggregate([
      { $match: { organizationId } },
      {
        $addFields: {
          totalCost: {
            $multiply: [
              { $ifNull: ["$assetCost.baseAmount", 0] },
              { $ifNull: ["$assetQuantity", 1] },
            ],
          },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          valuation: { $sum: "$totalCost" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const software = await SoftwareAsset.aggregate([
      { $match: { organizationId } },
      {
        $addFields: {
          totalCost: {
            $multiply: [
              { $ifNull: ["$assetCost.baseAmount", 0] },
              { $ifNull: ["$assetQuantity", 1] },
            ],
          },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          valuation: { $sum: "$totalCost" },
          count: { $sum: 1 },
        },
      },
    ]);

    const map = new Map();

    hardware.forEach(h => {
      const key = `${h._id.year}-${h._id.month}`;
      map.set(key, {
        year: h._id.year,
        month: h._id.month,
        hardwareValuation: h.valuation,
        softwareValuation: 0,
        totalValuation: h.valuation,
        hardwareCount: h.count,
        softwareCount: 0,
      });
    });

    software.forEach(s => {
      const key = `${s._id.year}-${s._id.month}`;
      const entry = map.get(key) || {
        year: s._id.year,
        month: s._id.month,
        hardwareValuation: 0,
        hardwareCount: 0,
      };

      entry.softwareValuation = s.valuation;
      entry.softwareCount = s.count;
      entry.totalValuation =
        entry.hardwareValuation + entry.softwareValuation;

      map.set(key, entry);
    });

    const trend = Array.from(map.values()).sort((a, b) =>
      a.year === b.year ? a.month - b.month : a.year - b.year
    );

    res.json({
      labels: trend.map(v => `${String(v.month).padStart(2, "0")}/${v.year}`),
      hardwareValuation: trend.map(v => v.hardwareValuation),
      softwareValuation: trend.map(v => v.softwareValuation),
      totalValuation: trend.map(v => v.totalValuation),
      hardwareCount: trend.map(v => v.hardwareCount),
      softwareCount: trend.map(v => v.softwareCount),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch valuation trend" });
  }
});

/* ======================================================
   👤 ACTIVE USERS (WORKING – LEFT AS IS)
====================================================== */
router.get("/active-users", authenticateToken(["admin", "user"]), async (req, res) => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const users = await User.find({
      organizationId: req.user.organizationId,
      lastActive: { $gte: cutoff },
    })
      .select("-password")
      .sort({ lastActive: -1 })
      .limit(5);

    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch active users" });
  }
});
router.get(
  "/software/monthly-subscriptions",
  authenticateToken(["admin", "user"]),
  async (req, res) => {
    try {
      const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
      const today = new Date();

      const softwares = await SoftwareAsset.find({
        organizationId,
        licenseType: "subscription",
        DOE: { $gte: today },
      });

      let totalMonthlySpend = 0;

      const data = softwares.map(s => {
        const yearlyCost =
          (s.assetCost?.baseAmount || 0) * (s.assetQuantity || 1);

        const monthlyCost = Number((yearlyCost / 12).toFixed(2));
        totalMonthlySpend += monthlyCost;

        return {
          name: s.assetName,
          monthlyCost,
        };
      });

      res.json({
        labels: data.map(d => d.name),
        monthlyCost: data.map(d => d.monthlyCost),
        currency: softwares[0]?.assetCost?.currency || "EUR",
        totalMonthlySpend: Number(totalMonthlySpend.toFixed(2)),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to fetch monthly software subscriptions",
      });
    }
  }
);
/* ======================================================
   ⏰ UPCOMING SOFTWARE LICENSE EXPIRY
====================================================== */
router.get(
  "/software/upcoming-expiry",
  authenticateToken(["admin", "user"]),
  async (req, res) => {
    try {
      const organizationId = new mongoose.Types.ObjectId(
        req.user.organizationId
      );

      const today = new Date();
      const in30 = new Date();
      const in60 = new Date();
      const in90 = new Date();

      in30.setDate(today.getDate() + 30);
      in60.setDate(today.getDate() + 60);
      in90.setDate(today.getDate() + 90);

      const softwares = await SoftwareAsset.find({
        organizationId,
        DOE: { $gte: today, $lte: in90 },
      }).sort({ DOE: 1 });

      const data = softwares.map(s => {
        const daysLeft = Math.ceil(
          (new Date(s.DOE) - today) / (1000 * 60 * 60 * 24)
        );

        return {
          name: s.assetName,
          expiryDate: s.DOE,
          daysLeft,
          quantity: s.assetQuantity,
          cost: s.assetCost?.baseAmount || 0,
          currency: s.assetCost?.currency || "USD",
          urgency:
            daysLeft <= 30
              ? "critical"
              : daysLeft <= 60
              ? "warning"
              : "normal",
        };
      });

      res.json({
        critical: data.filter(d => d.daysLeft <= 30),
        warning: data.filter(d => d.daysLeft > 30 && d.daysLeft <= 60),
        normal: data.filter(d => d.daysLeft > 60),
        totalExpiring: data.length,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to fetch upcoming software expiry",
      });
    }
  }
);

/* ======================================================
   📊 SOFTWARE LICENSE UTILIZATION
====================================================== */
router.get(
  "/software/license-utilization",
  authenticateToken(["admin", "user"]),
  async (req, res) => {
    try {
      const organizationId = new mongoose.Types.ObjectId(
        req.user.organizationId
      );

      const result = await SoftwareAsset.aggregate([
        { $match: { organizationId } },
        {
          $project: {
            assetName: 1,
            totalLicenses: { $ifNull: ["$assetQuantity", 0] },
            inUse: { $ifNull: ["$inUse", 0] },
          },
        },
        {
          $addFields: {
            available: {
              $subtract: ["$totalLicenses", "$inUse"],
            },
            utilizationPercent: {
              $cond: [
                { $eq: ["$totalLicenses", 0] },
                0,
                {
                  $multiply: [
                    { $divide: ["$inUse", "$totalLicenses"] },
                    100,
                  ],
                },
              ],
            },
          },
        },
      ]);

      res.json({
        labels: result.map(r => r.assetName),
        totalLicenses: result.map(r => r.totalLicenses),
        inUse: result.map(r => r.inUse),
        available: result.map(r => r.available),
        utilization: result.map(r =>
          Number(r.utilizationPercent.toFixed(2))
        ),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to fetch software license utilization",
      });
    }
  }
);

router.get(
  "/software/distribution",
  authenticateToken(["admin", "user"]),
  async (req, res) => {
    try {
      const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);

      const result = await SoftwareAsset.aggregate([
        { $match: { organizationId } },
        {
          $group: {
            _id: "$assetName",
            count: { $sum: "$assetQuantity" },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const totalLicenses = result.reduce(
        (sum, r) => sum + r.count,
        0
      );

      res.json({
        labels: result.map(r => r._id),
        values: result.map(r => r.count),
        totalLicenses,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to fetch software distribution",
      });
    }
  }
);


module.exports = router;
