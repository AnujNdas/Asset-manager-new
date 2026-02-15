const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const HardwareAsset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const CoreCompanyLicense = require("../models/CoreCompanyLicense");
const AssetAssignment = require("../models/AssetAssignment");
const User = require("../models/User");
const authenticateToken = require("../Middleware/Authentication-token");
const Department = require("../models/Department");

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
  {
    $match: {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    },
  },
  {
    $group: {
      _id: null,
      sum: {
        $sum: {
          $ifNull: ["$assetCost.baseTotalAmount", 0],
        },
      },
    },
  },
]);

const hardwareValuation = hardwareValuationAgg[0]?.sum || 0;


const softwareValuationAgg = await SoftwareAsset.aggregate([
  {
    $match: {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    },
  },
  {
    $group: {
      _id: null,
      sum: {
        $sum: {
          $ifNull: ["$assetCost.baseTotalAmount", 0],
        },
      },
    },
  },
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
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      },
      valuation: {
        $sum: {
          $ifNull: ["$assetCost.baseTotalAmount", 0],
        },
      },
      count: { $sum: 1 },
    },
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } },
]);


    const software = await SoftwareAsset.aggregate([
  { $match: { organizationId } },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      },
      valuation: {
        $sum: {
          $ifNull: ["$assetCost.baseTotalAmount", 0],
        },
      },
      count: { $sum: 1 },
    },
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } },
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


/**
 * =====================================================
 * 🔄 UPDATE USER ROLE
 * =====================================================
 */
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
  "/maintenance-due",
  authenticateToken(["admin", "user"]),
  async (req, res) => {
    try {
      const organizationId = new mongoose.Types.ObjectId(
        req.user.organizationId
      );

      const today = new Date();
      const next30Days = new Date();
      next30Days.setDate(today.getDate() + 30);

      const assets = await HardwareAsset.aggregate([
        {
          $match: {
            organizationId,
            DOE: { $exists: true, $nin: [null, ""] }
          }
        },

        // ✅ SAFE DATE CONVERSION
        {
          $addFields: {
            DOEDate: {
              $convert: {
                input: "$DOE",
                to: "date",
                onError: null,
                onNull: null
              }
            }
          }
        },

        // Remove failed conversions
        {
          $match: { DOEDate: { $ne: null } }
        },

        {
          $facet: {
            overdue: [
              { $match: { DOEDate: { $lt: today } } },
              {
                $addFields: {
                  daysOverdue: {
                    $floor: {
                      $divide: [
                        { $subtract: [today, "$DOEDate"] },
                        86400000
                      ]
                    }
                  }
                }
              }
            ],

            upcoming: [
              {
                $match: {
                  DOEDate: { $gte: today, $lte: next30Days }
                }
              },
              {
                $addFields: {
                  daysLeft: {
                    $ceil: {
                      $divide: [
                        { $subtract: ["$DOEDate", today] },
                        86400000
                      ]
                    }
                  }
                }
              }
            ]
          }
        }
      ]);

      res.json({ success: true, data: assets[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.get(
  "/cost-metrics",
  authenticateToken(["admin", "user"]), async (req, res) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);

    const metrics = await SoftwareAsset.aggregate([
      { $match: { organizationId } },

      {
        $group: {
          _id: "$type",
          totalQuantity: { $sum: "$assetQuantity" },
          totalCost: { $sum: "$assetCost.baseTotalAmount" },
          avgUnitCost: { $avg: "$assetCost.unitAmount" },
          currency: { $first: "$assetCost.currency" }
        }
      },

      {
        $project: {
          _id: 0,
          type: "$_id",
          totalQuantity: 1,
          totalCost: 1,
          avgCostPerLicense: { $round: ["$avgUnitCost", 2] },
          currency: 1
        }
      }
    ]);

    res.json({ success: true, data: metrics });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get(
  "/asset-distribution",
  authenticateToken(["admin", "user"]), async (req, res) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);

    const data = await AssetAssignment.aggregate([
      {
        $match: {
          organizationId,
          assignedToType: "Department",
          status: "active"
        }
      },

      {
        $group: {
          _id: {
            departmentId: "$assignedTo",
            assetType: "$assetType"
          },
          total: { $sum: "$quantity" }
        }
      },

      {
        $group: {
          _id: "$_id.departmentId",
          hardware: {
            $sum: {
              $cond: [{ $eq: ["$_id.assetType", "hardware"] }, "$total", 0]
            }
          },
          software: {
            $sum: {
              $cond: [{ $eq: ["$_id.assetType", "software"] }, "$total", 0]
            }
          }
        }
      },

      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "department"
        }
      },

      { $unwind: "$department" },

      {
        $project: {
          departmentId: "$_id",
          departmentName: "$department.name",
          hardware: 1,
          software: 1,
          totalAssets: { $add: ["$hardware", "$software"] }
        }
      }
    ]);

    res.json({ success: true, data });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.put(
  "/users/:id/department",
  authenticateToken(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const adminUser = req.user;
      const targetUserId = req.params.id;
      const { departmentId } = req.body;

      // 1️⃣ Validate departmentId
      if (!departmentId || !mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({
          error: "Valid departmentId is required",
        });
      }

      // 2️⃣ Find target user
      const user = await User.findById(targetUserId);

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // 3️⃣ Multi-tenant protection
      if (
        user.organizationId.toString() !==
        adminUser.organizationId.toString()
      ) {
        return res.status(403).json({
          error: "You cannot modify users from another organization",
        });
      }

      // 4️⃣ Prevent modifying super-admin department
      if (user.role === "super-admin") {
        return res.status(403).json({
          error: "Cannot modify super-admin department",
        });
      }

      // 5️⃣ Validate department belongs to same organization
      const department = await Department.findOne({
        _id: departmentId,
        organizationId: adminUser.organizationId,
        isActive: true,
      });

      if (!department) {
        return res.status(400).json({
          error: "Invalid or inactive department",
        });
      }

      // 6️⃣ OPTIONAL SAFETY RULE
      // Block department change if user has active asset assignments
      const activeAssignments = await AssetAssignment.exists({
        assignedToType: "User",
        assignedTo: user._id,
        status: "active",
      });

      if (activeAssignments) {
        return res.status(400).json({
          error:
            "Cannot change department while user has active asset assignments",
        });
      }

      // 7️⃣ Assign department
      user.departmentId = departmentId;
      await user.save();

      res.json({
        message: "Department assigned successfully",
        userId: user._id,
        departmentId,
      });

    } catch (error) {
      console.error("Department assignment error:", error);
      res.status(500).json({
        error: "Failed to assign department",
      });
    }
  }
);
module.exports = router;
