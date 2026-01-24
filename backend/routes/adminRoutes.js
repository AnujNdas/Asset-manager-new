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
   👥 USERS
====================================================== */
router.get("/users", authenticateToken(["admin", "user"]), async (req, res) => {
  const organizationId = req.user.organizationId;
  const users = await User.find({ organizationId }, "-password");
  res.json(users);
});

router.put(
  "/users/:id/role",
  authenticateToken(["admin", "user"]),
  async (req, res) => {
    try {
      const { role } = req.body;
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: req.params.id, organizationId: req.user.organizationId },
        { role },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch {
      res.status(500).json({ message: "Failed to update role" });
    }
  }
);

/* ======================================================
   📦 TOP LOCATIONS (FIXED)
====================================================== */
router.get(
  "/top-locations",
  authenticateToken(["admin", "user"]),
  async (req, res) => {
    try {
      const organizationId = new mongoose.Types.ObjectId(
        req.user.organizationId
      );

      const locations = await HardwareAsset.aggregate([
        /* ---------- HARDWARE ---------- */
        {
          $match: {
            organizationId,
            locationName: { $ne: null }
          }
        },
        {
          $group: {
            _id: "$locationName",
            count: { $sum: "$assetQuantity" } // optional: counts quantity
          }
        },

        /* ---------- SOFTWARE ---------- */
        {
          $unionWith: {
            coll: "softwareassets",
            pipeline: [
              {
                $match: {
                  organizationId,
                  locationName: { $ne: null }
                }
              },
              {
                $group: {
                  _id: "$locationName",
                  count: { $sum: 1 }
                }
              }
            ]
          }
        },

        /* ---------- MERGE ---------- */
        {
          $group: {
            _id: "$_id",
            count: { $sum: "$count" }
          }
        },

        /* ---------- LOOKUP LOCATION NAME ---------- */
        {
          $lookup: {
            from: "locations",
            localField: "_id",
            foreignField: "_id",
            as: "location"
          }
        },
        { $unwind: "$location" },

        {
          $project: {
            _id: 0,
            locationId: "$_id",
            name: "$location.name",
            count: 1
          }
        },

        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      res.json(locations);
    } catch (error) {
      console.error("Top locations error:", error);
      res.status(500).json({ error: "Failed to fetch top locations" });
    }
  }
);




/* ======================================================
   ⏳ EXPIRING ASSETS (UNCHANGED)
====================================================== */
router.get("/expiring-assets", authenticateToken(["admin", "user"]), async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    const expiringHardware = await HardwareAsset.find({
      organizationId,
      DOE: { $gte: today, $lte: threeMonthsLater },
    });

    const expiringSoftware = await SoftwareAsset.find({
      organizationId,
      licenseExpiry: { $gte: today, $lte: threeMonthsLater },
    });

    res.json({
      expiringHardware: expiringHardware.map(h => ({
        _id: h._id,
        name: h.hardwareName,
        expiry: h.DOE,
        type: "Hardware",
      })),
      expiringSoftware: expiringSoftware.map(s => ({
        _id: s._id,
        name: s.name,
        expiry: s.licenseExpiry,
        type: "Software",
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch expiring assets" });
  }
});

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

module.exports = router;
