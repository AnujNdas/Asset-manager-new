const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const AssetInstance = require("../models/AssetInstance");
const Hardware = require("../models/Asset");
const Software = require("../models/SoftwareAsset");
const AssetAssignment = require("../models/AssetAssignment");
const User = require("../models/User");
const Team = require("../models/Employee");
const authenticateToken = require("../Middleware/Authentication-token");
const Department = require("../models/Department");
router.get("/dashboard", authenticateToken(), async (req, res) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(
      req.user.organizationId
    );

    const now = new Date();

    /* ================= INSTANCE BASED TOTALS ================= */

    const softwareStatsPromise = AssetInstance.aggregate([
      {
        $match: {
          organizationId,
          assetType: "software",
        },
      },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $ifNull: ["$software.purchaseCost.amount", 0] },
          },
          totalMaintenance: {
            $sum: { $ifNull: ["$software.costs.renewalCost", 0] },
          },
          totalQuantity: { $sum: 1 },
        },
      },
    ]);

    const hardwareStatsPromise = AssetInstance.aggregate([
      {
        $match: {
          organizationId,
          assetType: "hardware",
        },
      },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $ifNull: ["$hardware.purchaseCost.amount", 0] },
          },
          totalMaintenance: {
            $sum: {
              $add: [
                { $ifNull: ["$hardware.costs.maintenanceCost", 0] },
                { $ifNull: ["$hardware.costs.warrantyRenewalCost", 0] },
                { $ifNull: ["$hardware.costs.insuranceCost", 0] },
              ],
            },
          },
          totalQuantity: { $sum: 1 },
        },
      },
    ]);
          /* ================= Location based queries  ================= */
          const topHardwareLocationsPromise = Hardware.aggregate([
  { $match: { organizationId } },

  {
    $lookup: {
      from: "assetinstances",
      localField: "_id",
      foreignField: "assetId",
      as: "instances",
    },
  },

  {
    $addFields: {
      instanceCount: { $size: "$instances" },
    },
  },

  {
    $group: {
      _id: "$locationName",
      total: { $sum: "$instanceCount" },
    },
  },

  { $sort: { total: -1 } },
  { $limit: 5 },

  {
    $lookup: {
      from: "locations",
      localField: "_id",
      foreignField: "_id",
      as: "location",
    },
  },
  { $unwind: "$location" },
]);
const topSoftwareLocationsPromise = Software.aggregate([
  { $match: { organizationId } },

  {
    $lookup: {
      from: "assetinstances",
      localField: "_id",
      foreignField: "assetId",
      as: "instances",
    },
  },

  {
    $addFields: {
      instanceCount: { $size: "$instances" },
    },
  },

  {
    $group: {
      _id: "$locationName",
      total: { $sum: "$instanceCount" },
    },
  },

  { $sort: { total: -1 } },
  { $limit: 5 },

  {
    $lookup: {
      from: "locations",
      localField: "_id",
      foreignField: "_id",
      as: "location",
    },
  },
  { $unwind: "$location" },
]);
    /* ================= REMAINING OLD PROMISES (UNCHANGED) ================= */

    const [
      softwareStats,
      hardwareStats,
      usersCount,
      teamsCount,

      expiredSoftware,
      upcomingSoftware,

      expiredWarranty,
      upcomingWarranty,

      expiredMaintenance,
      upcomingMaintenance,

      expiredInsurance,
      upcomingInsurance,

      softwareSpendByCategory,
      topSoftware,
topSoftwareLocations,
topHardwareLocations,
      departmentAssignments,
    ] = await Promise.all([
      softwareStatsPromise,
      hardwareStatsPromise,

      User.countDocuments({ organizationId }),
      Team.countDocuments({ organizationId }),

      // ❗ STILL OLD LOGIC (we fix next step)
      Software.aggregate([
        { $match: { organizationId, DOE: { $lt: now } } },
        { $project: { assetName: 1, DOE: 1, "assetCost.baseTotalAmount": 1 } },
        { $sort: { DOE: -1 } },
        { $limit: 5 },
      ]),

      Software.aggregate([
        {
          $match: {
            organizationId,
            DOE: { $gte: now },
          },
        },
        {
          $project: {
            assetName: 1,
            DOE: 1,
            "assetCost.baseTotalAmount": 1,
          },
        },
        { $sort: { DOE: 1 } },
        { $limit: 5 },
      ]),

      Hardware.aggregate([
        {
          $match: {
            organizationId,
            "warranty.expiryDate": { $lt: now },
          },
        },
        {
          $project: {
            assetName: 1,
            "warranty.expiryDate": 1,
            "assetCost.baseTotalAmount": 1,
          },
        },
        { $sort: { "warranty.expiryDate": -1 } },
        { $limit: 5 },
      ]),

      Hardware.aggregate([
        {
          $match: {
            organizationId,
            "warranty.expiryDate": { $gte: now },
          },
        },
        {
          $project: {
            assetName: 1,
            "warranty.expiryDate": 1,
            "assetCost.baseTotalAmount": 1,
          },
        },
        { $sort: { "warranty.expiryDate": 1 } },
        { $limit: 5 },
      ]),

      Hardware.aggregate([
        { $match: { organizationId, DOE: { $lt: now } } },
        { $project: { assetName: 1, DOE: 1, "assetCost.baseTotalAmount": 1 } },
        { $sort: { DOE: -1 } },
        { $limit: 5 },
      ]),

      Hardware.aggregate([
        {
          $match: {
            organizationId,
            DOE: { $gte: now },
          },
        },
        {
          $project: {
            assetName: 1,
            DOE: 1,
            "assetCost.baseTotalAmount": 1,
          },
        },
        { $sort: { DOE: 1 } },
        { $limit: 5 },
      ]),

      Hardware.aggregate([
        {
          $match: {
            organizationId,
            "insurance.expiryDate": { $lt: now },
          },
        },
        {
          $project: {
            assetName: 1,
            "insurance.expiryDate": 1,
            "assetCost.baseTotalAmount": 1,
          },
        },
        { $sort: { "insurance.expiryDate": -1 } },
        { $limit: 5 },
      ]),

      Hardware.aggregate([
        {
          $match: {
            organizationId,
            "insurance.expiryDate": { $gte: now },
          },
        },
        {
          $project: {
            assetName: 1,
            "insurance.expiryDate": 1,
            "assetCost.baseTotalAmount": 1,
          },
        },
        { $sort: { "insurance.expiryDate": 1 } },
        { $limit: 5 },
      ]),

      Software.aggregate([
        { $match: { organizationId } },
        {
          $group: {
            _id: "$assetCategory",
            totalSpend: { $sum: "$assetCost.baseTotalAmount" },
          },
        },
        { $sort: { totalSpend: -1 } },
        { $limit: 5 },
      ]),

      Software.find({ organizationId })
        .sort({ "assetCost.baseTotalAmount": -1 })
        .limit(5)
        .select("assetName assetCost.baseTotalAmount")
        .lean(),

      topSoftwareLocationsPromise,
      topHardwareLocationsPromise,
      AssetAssignment.aggregate([
        {
          $match: {
            organizationId,
            status: "active",
          },
        },
        {
          $group: {
            _id: "$departmentId",
            totalAssignedQuantity: { $sum: "$quantity" },
          },
        },
      ]),
    ]);
    const mergedLocations = [
  ...topSoftwareLocations,
  ...topHardwareLocations,
].reduce((acc, item) => {
  const name = item.location?.name;

  if (!name) return acc;

  acc[name] = (acc[name] || 0) + item.total;

  return acc;
}, {});

const topLocations = Object.entries(mergedLocations)
  .map(([name, total]) => ({ name, total }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 5);
    /* ================= SAFE FALLBACK ================= */

    const softwareData = softwareStats[0] || {
      totalValue: 0,
      totalMaintenance: 0,
      totalQuantity: 0,
    };

    const hardwareData = hardwareStats[0] || {
      totalValue: 0,
      totalMaintenance: 0,
      totalQuantity: 0,
    };

    /* ================= RESPONSE ================= */

    res.json({
      totals: {
        overallValuation:
          softwareData.totalValue + hardwareData.totalValue,

        softwareValuation: softwareData.totalValue,
        hardwareValuation: hardwareData.totalValue,

        softwareCount: softwareData.totalQuantity,
        hardwareCount: hardwareData.totalQuantity,

        // ✅ NEW (important for dashboard)
        softwareMaintenance: softwareData.totalMaintenance,
        hardwareMaintenance: hardwareData.totalMaintenance,

        usersCount,
        teamsCount,
      },

      upcoming: {
        software: {
          expired: expiredSoftware,
          upcoming: upcomingSoftware,
        },
        warranty: {
          expired: expiredWarranty,
          upcoming: upcomingWarranty,
        },
        maintenance: {
          expired: expiredMaintenance,
          upcoming: upcomingMaintenance,
        },
        insurance: {
          expired: expiredInsurance,
          upcoming: upcomingInsurance,
        },
      },

      analytics: {
        spendByCategory: softwareSpendByCategory,
        topAssets: topSoftware,
        departmentAssignments,
        topLocations
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});

router.put(
  "/users/:id/role",
  authenticateToken(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const adminUser = req.user;
      const targetUserId = req.params.id;
      const { role } = req.body;

      if (!role || !["user", "admin"].includes(role)) {
        return res.status(400).json({
          error: "Invalid role. Allowed roles: user, admin",
        });
      }

      const user = await User.findById(targetUserId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // 🔒 Organization protection (multi-tenant safety)
      if (
        user.organizationId.toString() !==
        adminUser.organizationId.toString()
      ) {
        return res.status(403).json({
          error: "You cannot modify users from another organization",
        });
      }

      // 🔒 Prevent modifying super admin
      if (user.role === "super-admin") {
        return res.status(403).json({
          error: "Super Admin role cannot be modified",
        });
      }

      user.role = role;
      await user.save();

      res.json({
        message: "User role updated successfully",
      });
    } catch (error) {
      console.error("Error updating role:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          error: "Duplicate key error",
        });
      }

      res.status(500).json({
        error: "Failed to update role",
      });
    }
  }
);
router.get(
  "/users",
  authenticateToken(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const users = await User.find({
        organizationId: new mongoose.Types.ObjectId(organizationId),
      })
        .populate("departmentId", "name")   // ✅ ADD THIS
        .select("-password")
        .sort({ createdAt: -1 });

      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

module.exports = router;
