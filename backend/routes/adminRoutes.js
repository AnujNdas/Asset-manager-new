const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Hardware = require("../models/Asset");
const Software = require("../models/SoftwareAsset");
const AssetAssignment = require("../models/AssetAssignment");
const User = require("../models/User");
const authenticateToken = require("../Middleware/Authentication-token");
const Department = require("../models/Department");
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const now = new Date();
    const next30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [
      softwareStats,
      hardwareStats,
      usersCount,
      teamsCount,
      upcomingSoftware,
      upcomingHardware,
      softwareSpendByCategory,
      topSoftware,
      topHardware,
      topSoftwareLocations,
      topHardwareLocations
    ] = await Promise.all([

      // SOFTWARE TOTALS
      Software.aggregate([
        { $match: { organizationId } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: "$assetCost.baseTotalAmount" },
            totalQuantity: { $sum: "$assetQuantity" }
          }
        }
      ]),

      // HARDWARE TOTALS
      Hardware.aggregate([
        { $match: { organizationId } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: "$assetCost.baseTotalAmount" },
            totalQuantity: { $sum: "$assetQuantity" }
          }
        }
      ]),

      User.countDocuments({ organizationId }),
      Team.countDocuments({ organizationId }),

      // UPCOMING SOFTWARE RENEWALS (30 DAYS)
      Software.aggregate([
        {
          $match: {
            organizationId,
            DOE: { $gte: now, $lte: next30Days }
          }
        },
        {
          $project: {
            assetName: 1,
            DOE: 1,
            "assetCost.baseTotalAmount": 1
          }
        },
        { $sort: { DOE: 1 } },
        { $limit: 5 }
      ]),

      // UPCOMING HARDWARE WARRANTY
      Hardware.aggregate([
        {
          $match: {
            organizationId,
            "warranty.expiryDate": { $gte: now, $lte: next30Days }
          }
        },
        {
          $project: {
            assetName: 1,
            "warranty.expiryDate": 1,
            "assetCost.baseTotalAmount": 1
          }
        },
        { $sort: { "warranty.expiryDate": 1 } },
        { $limit: 5 }
      ]),

      // SOFTWARE SPEND BY CATEGORY WITH NAME
      Software.aggregate([
        { $match: { organizationId } },
        {
          $group: {
            _id: "$assetCategory",
            totalSpend: { $sum: "$assetCost.baseTotalAmount" }
          }
        },
        { $sort: { totalSpend: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            pipeline: [{ $project: { name: 1 } }],
            as: "category"
          }
        },
        { $unwind: "$category" }
      ]),

      // TOP SOFTWARE ASSETS
      Software.find({ organizationId })
        .sort({ "assetCost.baseTotalAmount": -1 })
        .limit(5)
        .select("assetName assetCost.baseTotalAmount")
        .lean(),

      // TOP HARDWARE ASSETS
      Hardware.find({ organizationId })
        .sort({ "assetCost.baseTotalAmount": -1 })
        .limit(5)
        .select("assetName assetCost.baseTotalAmount")
        .lean(),

      // SOFTWARE LOCATION DISTRIBUTION
      Software.aggregate([
        { $match: { organizationId } },
        {
          $group: {
            _id: "$locationName",
            total: { $sum: "$assetQuantity" }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "locations",
            localField: "_id",
            foreignField: "_id",
            pipeline: [{ $project: { name: 1 } }],
            as: "location"
          }
        },
        { $unwind: "$location" }
      ]),

      // HARDWARE LOCATION DISTRIBUTION
      Hardware.aggregate([
        { $match: { organizationId } },
        {
          $group: {
            _id: "$locationName",
            total: { $sum: "$assetQuantity" }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "locations",
            localField: "_id",
            foreignField: "_id",
            pipeline: [{ $project: { name: 1 } }],
            as: "location"
          }
        },
        { $unwind: "$location" }
      ])
    ]);

    // Merge Top Assets
    const topAssets = [...topSoftware, ...topHardware]
      .sort((a, b) =>
        b.assetCost.baseTotalAmount - a.assetCost.baseTotalAmount
      )
      .slice(0, 5);

    // Merge Locations
    const mergedLocations = [...topSoftwareLocations, ...topHardwareLocations]
      .reduce((acc, item) => {
        const name = item.location.name;
        acc[name] = (acc[name] || 0) + item.total;
        return acc;
      }, {});

    const topLocations = Object.entries(mergedLocations)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const softwareData = softwareStats[0] || { totalValue: 0, totalQuantity: 0 };
    const hardwareData = hardwareStats[0] || { totalValue: 0, totalQuantity: 0 };

    res.json({
      totals: {
        overallValuation:
          softwareData.totalValue + hardwareData.totalValue,
        softwareValuation: softwareData.totalValue,
        hardwareValuation: hardwareData.totalValue,
        softwareCount: softwareData.totalQuantity,
        hardwareCount: hardwareData.totalQuantity,
        usersCount,
        teamsCount
      },
      upcoming: {
        softwareRenewals: upcomingSoftware,
        hardwareWarranty: upcomingHardware
      },
      analytics: {
        spendByCategory: softwareSpendByCategory.map(c => ({
          category: c.category.name,
          totalSpend: c.totalSpend
        })),
        topAssets,
        topLocations
      }
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
