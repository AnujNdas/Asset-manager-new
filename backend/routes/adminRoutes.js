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
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const now = new Date();

    /* =====================================================
       🧮 INSTANCE BASED TOTALS
    ===================================================== */

    const totalsPromise = AssetInstance.aggregate([
      { $match: { organizationId } },
      { 
        $addFields: {
          purchaseCost: {
            $cond: [
              { $eq: ["$assetType", "hardware"] },
              { $ifNull: ["$hardware.purchaseCost.baseAmount", 0] },
              { $ifNull: ["$software.purchaseCost.baseAmount", 0] }
            ]
          }
        }
      },
      {
        $group: {
          _id: "$assetType",
          totalValue: { $sum: "$purchaseCost" },
          totalInstances: { $sum: 1 }
        }
      }
    ]);

    /* =====================================================
       📦 ASSET COUNTS
    ===================================================== */

    const assetCountsPromise = Promise.all([
      Hardware.countDocuments({ organizationId }),
      Software.countDocuments({ organizationId })
    ]);

    /* =====================================================
       🏷️ TOP CATEGORY (INSTANCE COST)
    ===================================================== */

    const topCategoriesPromise = AssetInstance.aggregate([
      { $match: { organizationId } },

      {
        $lookup: {
          from: "assets",
          localField: "assetId",
          foreignField: "_id",
          as: "asset"
        }
      },
      { $unwind: "$asset" },

      {
        $addFields: {
          cost: {
  $cond: [
    { $eq: ["$assetType", "hardware"] },
    { $ifNull: ["$hardware.purchaseCost.baseAmount", 0] },
    { $ifNull: ["$software.purchaseCost.baseAmount", 0] }
  ]
}
        }
      },

      {
        $group: {
          _id: "$asset.assetCategory",
          total: { $sum: "$cost" }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    /* =====================================================
       💻 TOP SOFTWARE (IT ASSETS)
    ===================================================== */

    const topSoftwarePromise = AssetInstance.aggregate([
      { $match: { organizationId, assetType: "software" } },

      {
        $lookup: {
          from: "softwareassets",
          localField: "assetId",
          foreignField: "_id",
          as: "asset"
        }
      },
      { $unwind: "$asset" },

      {
        $addFields: {
          cost: { $ifNull: ["$software.purchaseCost.baseAmount", 0] }
        }
      },

      {
        $group: {
          _id: "$asset._id",
          assetName: { $first: "$asset.assetName" },
          total: { $sum: "$cost" }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    /* =====================================================
       🏢 DEPARTMENT ASSIGNMENTS (SEPARATE)
    ===================================================== */

    const departmentPromise = AssetAssignment.aggregate([
      { $match: { organizationId, status: "active" } },

      {
        $lookup: {
          from: "assetinstances",
          localField: "instanceId",
          foreignField: "_id",
          as: "instance"
        }
      },
      { $unwind: "$instance" },

      {
        $group: {
          _id: {
            department: "$departmentId",
            type: "$instance.assetType"
          },
          total: { $sum: 1 }
        }
      }
    ]);

    /* =====================================================
       📅 UPCOMING EVENTS (INSTANCE BASED)
    ===================================================== */

    const upcomingPromise = AssetInstance.aggregate([
      { $match: { organizationId } },

      {
        $project: {
          assetId: 1,
          assetType: 1,
          deviceName: 1,

          warranty: "$hardware.warrantyExpiry",
          maintenance: "$hardware.nextMaintenanceDate",
          insurance: "$hardware.insuranceExpiry",
          renewal: "$software.renewalDate"
        }
      },

      {
        $facet: {
          warranty: [
            { $match: { warranty: { $gte: now } } },
            { $sort: { warranty: 1 } },
            { $limit: 5 }
          ],
          maintenance: [
            { $match: { maintenance: { $gte: now } } },
            { $sort: { maintenance: 1 } },
            { $limit: 5 }
          ],
          insurance: [
            { $match: { insurance: { $gte: now } } },
            { $sort: { insurance: 1 } },
            { $limit: 5 }
          ],
          renewal: [
            { $match: { renewal: { $gte: now } } },
            { $sort: { renewal: 1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    /* =====================================================
       📍 TOP LOCATIONS (INSTANCE BASED)
    ===================================================== */

    const topLocationsPromise = AssetInstance.aggregate([
      { $match: { organizationId } },

      {
        $group: {
          _id: "$location",
          totalInstances: { $sum: 1 }
        }
      },

      { $sort: { totalInstances: -1 } },
      { $limit: 5 }
    ]);

    /* =====================================================
       🚀 EXECUTE ALL
    ===================================================== */

    const [
      totals,
      [hardwareAssets, softwareAssets],
      topCategories,
      topSoftware,
      departments,
      upcoming,
      topLocations
    ] = await Promise.all([
      totalsPromise,
      assetCountsPromise,
      topCategoriesPromise,
      topSoftwarePromise,
      departmentPromise,
      upcomingPromise,
      topLocationsPromise
    ]);

    /* =====================================================
       🧠 FORMAT TOTALS
    ===================================================== */

    const map = {};
    totals.forEach(t => (map[t._id] = t));

    const hardware = map["hardware"] || {};
    const software = map["software"] || {};

    /* =====================================================
       ✅ RESPONSE
    ===================================================== */

    res.json({
      totals: {
        totalValue: (hardware.totalValue || 0) + (software.totalValue || 0),

        hardwareValue: hardware.totalValue || 0,
        softwareValue: software.totalValue || 0,

        hardwareAssets,
        softwareAssets,

        hardwareInstances: hardware.totalInstances || 0,
        softwareInstances: software.totalInstances || 0,

        totalAssets: hardwareAssets + softwareAssets,
        totalInstances:
          (hardware.totalInstances || 0) +
          (software.totalInstances || 0)
      },

      analytics: {
        topCategories,
        topSoftware,
        departments,
        topLocations
      },

      upcoming: upcoming[0] || {}
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
