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
            { $ifNull: ["$hardware.purchaseCost.amount", 0] },
            { $ifNull: ["$software.purchaseCost.amount", 0] }
          ]
        },

        extraCost: {
          $add: [
            { $ifNull: ["$hardware.costs.maintenanceCost.amount", 0] },
            { $ifNull: ["$hardware.costs.warrantyRenewalCost.amount", 0] },
            { $ifNull: ["$hardware.costs.insuranceCost.amount", 0] },
            { $ifNull: ["$software.costs.renewalCost.amount", 0] }
          ]
        }
      }
    },

    {
      $group: {
        _id: "$assetType",

        totalPurchase: { $sum: "$purchaseCost" }, // ✅ ONLY purchase
        totalExtra: { $sum: "$extraCost" },       // ✅ other costs
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

    // ✅ cost calculation (same as yours)
    {
      $addFields: {
        cost: {
          $add: [
            {
              $cond: [
                { $eq: ["$assetType", "hardware"] },
                { $ifNull: ["$hardware.purchaseCost.amount", 0] },
                { $ifNull: ["$software.purchaseCost.amount", 0] }
              ]
            },
            { $ifNull: ["$hardware.costs.maintenanceCost.amount", 0] },
            { $ifNull: ["$hardware.costs.warrantyRenewalCost.amount", 0] },
            { $ifNull: ["$hardware.costs.insuranceCost.amount", 0] },
            { $ifNull: ["$software.costs.renewalCost.amount", 0] }
          ]
        }
      }
    },

    // ✅ group by category ID
    {
      $group: {
        _id: "$asset.assetCategory",
        total: { $sum: "$cost" }
      }
    },

    // ✅ 🔥 IMPORTANT: lookup category collection
    {
      $lookup: {
        from: "categories", // ⚠️ verify exact collection name
        localField: "_id",
        foreignField: "_id",
        as: "category"
      }
    },

    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $project: {
        _id: 0,
        category: "$category.name", // ✅ actual name
        total: 1
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
      cost: {
        $add: [
          { $ifNull: ["$software.purchaseCost.amount", 0] },
          { $ifNull: ["$software.costs.renewalCost.amount", 0] }
        ]
      }
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
        Extra Cost Related Fields (SEPARATE)
      ===================================================== */
  const topMaintenancePromise = AssetInstance.aggregate([
    { $match: { organizationId, assetType: "hardware" } },

    {
      $project: {
        instanceName: "$deviceName",
        cost: "$hardware.costs.maintenanceCost.amount"
      }
    },

    { $sort: { cost: -1 } },
    { $limit: 5 }
  ]);

  const topWarrantyPromise = AssetInstance.aggregate([
    { $match: { organizationId, assetType: "hardware" } },

    {
      $project: {
        instanceName: "$deviceName",
        cost: "$hardware.costs.warrantyRenewalCost.amount"
      }
    },

    { $sort: { cost: -1 } },
    { $limit: 5 }
  ]);

  const topInsurancePromise = AssetInstance.aggregate([
    { $match: { organizationId, assetType: "hardware" } },

    {
      $project: {
        instanceName: "$deviceName",
        cost: "$hardware.costs.insuranceCost.amount"
      }
    },

    { $sort: { cost: -1 } },
    { $limit: 5 }
  ]);
  const topRenewalPromise = AssetInstance.aggregate([
    { $match: { organizationId, assetType: "software" } },

    {
      $project: {
        instanceName: "$deviceName",
        cost: "$software.costs.renewalCost.amount"
      }
    },

    { $sort: { cost: -1 } },
    { $limit: 5 }
  ]);
      /* =====================================================
        🏢 DEPARTMENT ASSIGNMENTS (SEPARATE)
      ===================================================== */
  const departmentPromise = AssetAssignment.aggregate([
    { $match: { organizationId, status: "active" } },

    /* ================= INSTANCE ================= */
    {
      $lookup: {
        from: "assetinstances",
        localField: "assetInstanceId",
        foreignField: "_id",
        as: "instance"
      }
    },
    { $unwind: "$instance" },

    /* ================= ASSET (HARDWARE) ================= */
    {
      $lookup: {
        from: "assets",
        localField: "instance.assetId",
        foreignField: "_id",
        as: "hardwareAsset"
      }
    },

    /* ================= ASSET (SOFTWARE) ================= */
    {
      $lookup: {
        from: "softwareassets",
        localField: "instance.assetId",
        foreignField: "_id",
        as: "softwareAsset"
      }
    },

    /* ================= PICK CORRECT NAME ================= */
    {
      $addFields: {
        assetName: {
          $cond: [
            { $eq: ["$instance.assetType", "hardware"] },
            { $arrayElemAt: ["$hardwareAsset.assetName", 0] },
            { $arrayElemAt: ["$softwareAsset.assetName", 0] }
          ]
        }
      }
    },

    /* ================= GROUP BY DEPT ================= */
    {
      $group: {
        _id: "$departmentId",

        hardware: {
          $sum: {
            $cond: [{ $eq: ["$instance.assetType", "hardware"] }, 1, 0]
          }
        },

        software: {
          $sum: {
            $cond: [{ $eq: ["$instance.assetType", "software"] }, 1, 0]
          }
        },

        assets: { $addToSet: "$assetName" } // ✅ unique asset names
      }
    },

    /* ================= DEPARTMENT NAME ================= */
    {
      $lookup: {
        from: "departments",
        localField: "_id",
        foreignField: "_id",
        as: "department"
      }
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true
      }
    },

    /* ================= FINAL ================= */
    {
      $project: {
        _id: 0,
        departmentId: "$_id",
        departmentName: "$department.name",
        hardware: 1,
        software: 1,
        assets: 1
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

  /* ================= JOIN ASSET ================= */
  {
    $lookup: {
      from: "assets",
      localField: "assetId",
      foreignField: "_id",
      as: "asset"
    }
  },
  { $unwind: { path: "$asset", preserveNullAndEmptyArrays: true } },

  /* ================= LOCATION NAME ================= */
  {
    $lookup: {
      from: "locations",
      localField: "asset.locationName",
      foreignField: "_id",
      as: "assetLocationObj"
    }
  },
  { $unwind: { path: "$assetLocationObj", preserveNullAndEmptyArrays: true } },

  /* ================= ✅ FIXED ASSIGNMENT LOOKUP ================= */
  {
    $lookup: {
      from: "assetassignments", // ✅ FIXED
      let: { instId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$assetInstanceId", "$$instId"] // ✅ ObjectId match
            }
          }
        }
      ],
      as: "assignment"
    }
  },

  /* ================= DEBUG ================= */
  {
    $addFields: {
      debug_assignment_count: { $size: "$assignment" }
    }
  },

  /* ================= NORMALIZE ================= */
  {
    $addFields: {
      instanceLocation: "$location",
      assetLocation: "$assetLocationObj.name",

      assignedLocationsArray: {
        $map: {
          input: "$assignment",
          as: "a",
          in: "$$a.location"
        }
      },

finalLocation: {
  $ifNull: [
    {
      $arrayElemAt: [
        {
          $map: {
            input: "$assignment",
            as: "a",
            in: "$$a.location"
          }
        },
        0
      ]
    },
    {
      $ifNull: [
        "$assetLocationObj.name",
        "$location"
      ]
    }
  ]
}

      isAssigned: {
        $cond: [{ $gt: [{ $size: "$assignment" }, 0] }, 1, 0]
      },

      isHardware: { $eq: ["$assetType", "hardware"] },
      isSoftware: { $eq: ["$assetType", "software"] },

      assetName: "$asset.assetName",

      /* 💰 COSTS */
      purchaseCost: {
        $cond: [
          { $eq: ["$assetType", "hardware"] },
          { $ifNull: ["$hardware.purchaseCost.amount", 0] },
          { $ifNull: ["$software.purchaseCost.amount", 0] }
        ]
      },

      maintenanceCost: {
        $ifNull: ["$hardware.costs.maintenanceCost.amount", 0]
      },

      warrantyCost: {
        $ifNull: ["$hardware.costs.warrantyRenewalCost.amount", 0]
      },

      insuranceCost: {
        $ifNull: ["$hardware.costs.insuranceCost.amount", 0]
      }
    }
  },

  /* ================= GROUP ================= */
  {
    $group: {
      _id: "$finalLocation",

      totalInstances: { $sum: 1 },

      hardwareCount: {
        $sum: { $cond: ["$isHardware", 1, 0] }
      },

      softwareCount: {
        $sum: { $cond: ["$isSoftware", 1, 0] }
      },

      assignedCount: { $sum: "$isAssigned" },

      instanceLocations: { $addToSet: "$instanceLocation" },
      assetLocations: { $addToSet: "$assetLocation" },

      assignedLocations: { $push: "$assignedLocationsArray" },

      assetNames: { $addToSet: "$assetName" },

      purchaseValue: { $sum: "$purchaseCost" },
      maintenanceTotal: { $sum: "$maintenanceCost" },
      warrantyTotal: { $sum: "$warrantyCost" },
      insuranceTotal: { $sum: "$insuranceCost" },

      upcomingMaintenance: {
        $sum: {
          $cond: [
            { $gt: ["$hardware.nextMaintenanceDate", new Date()] },
            1,
            0
          ]
        }
      },

      debug_assignment_count: { $sum: "$debug_assignment_count" }
    }
  },

  /* ================= FLATTEN ASSIGNED LOCATIONS ================= */
  {
    $addFields: {
      assignedLocations: {
        $reduce: {
          input: "$assignedLocations",
          initialValue: [],
          in: { $setUnion: ["$$value", "$$this"] }
        }
      }
    }
  },

  /* ================= FINAL ================= */
  {
    $addFields: {
      totalValue: {
        $add: [
          "$purchaseValue",
          "$maintenanceTotal",
          "$warrantyTotal",
          "$insuranceTotal"
        ]
      }
    }
  },

  {
    $project: {
      _id: 0,
      name: "$_id",

      total: "$totalInstances",
      hardware: "$hardwareCount",
      software: "$softwareCount",
      assigned: "$assignedCount",

      instanceLocations: 1,
      assetLocations: 1,
      assignedLocations: 1,
      assetNames: 1,

      debug_assignment_count: 1, // keep temporarily

      costs: {
        purchase: "$purchaseValue",
        maintenance: "$maintenanceTotal",
        warranty: "$warrantyTotal",
        insurance: "$insuranceTotal"
      },

      upcomingMaintenance: 1,
      value: "$totalValue"
    }
  },

  { $sort: { value: -1 } },
  { $limit: 5 }
]);
      const usersCountPromise = User.countDocuments({ organizationId });

      const employeesCountPromise = Team.countDocuments({ organizationId });
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
    topLocations,
    usersCount,
    employeesCount,
    topMaintenance,
    topWarranty,
    topInsurance,
    topRenewal
  ] = await Promise.all([
    totalsPromise,
    assetCountsPromise,
    topCategoriesPromise,
    topSoftwarePromise,
    departmentPromise,
    upcomingPromise,
    topLocationsPromise,
    usersCountPromise,
    employeesCountPromise,
    topMaintenancePromise,
    topWarrantyPromise,
    topInsurancePromise,
    topRenewalPromise
  ]);
      /* =====================================================
        🧠 FORMAT TOTALS
      ===================================================== */

      const map = {};
      totals.forEach(t => (map[t._id] = t));

  const hardware = map["hardware"] || {};
  const software = map["software"] || {};

  const hardwarePurchase = hardware.totalPurchase || 0;
  const softwarePurchase = software.totalPurchase || 0;

  const hardwareExtra = hardware.totalExtra || 0;
  const softwareExtra = software.totalExtra || 0;

  const overallValuation =
    hardwarePurchase + softwarePurchase +
    hardwareExtra + softwareExtra;
      /* =====================================================
        ✅ RESPONSE
      ===================================================== */

  res.json({
    totals: {
      overallValuation,

    hardwarePurchaseValue: hardwarePurchase,
    softwarePurchaseValue: softwarePurchase,

      hardwareCount: hardwareAssets,
      softwareCount: softwareAssets,

      hardwareInstances: hardware.totalInstances || 0,
      softwareInstances: software.totalInstances || 0,

      usersCount: usersCount || 0,
      employeesCount: employeesCount || 0,
    },

    analytics: {
      spendByCategory: topCategories.map(c => ({
        category: c.category,   // ✅ correct field
        totalSpend: c.total
      })),

      topAssets: topSoftware.map(a => ({
        assetName: a.assetName,
        totalCost: a.total
      })),

      departmentAssignments: departments,

  topLocations: topLocations.map(l => ({
    name: l.name, // ✅ FIXED

    total: l.total,

    hardware: l.hardware,
    software: l.software,
    assigned: l.assigned,

    value: l.value,

    costs: {
      purchase: l.costs?.purchase || 0,
      maintenance: l.costs?.maintenance || 0,
      warranty: l.costs?.warranty || 0,
      insurance: l.costs?.insurance || 0
    },

    upcomingMaintenance: l.upcomingMaintenance,

    // 🔥 FULL LOCATION CONTEXT
    instanceLocations: l.instanceLocations || [],
    assetLocations: l.assetLocations || [],
    assignedLocations: l.assignedLocations || [],

    // 🔥 NEW (you added in pipeline)
    assetNames: l.assetNames || [],
      debug: {
    assignmentCount: l.debug_assignment_count
  }
  }))
    },

    upcoming: {
      software: {
        upcoming: upcoming[0]?.renewal || []
      },
      maintenance: {
        upcoming: upcoming[0]?.maintenance || []
      },
      warranty: {
        upcoming: upcoming[0]?.warranty || []
      },
      insurance: {
        upcoming: upcoming[0]?.insurance || []
      }
    },
    
    costBreakdown: {
      maintenance: topMaintenance,
      warranty: topWarranty,
      insurance: topInsurance,
      renewal: topRenewal
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
