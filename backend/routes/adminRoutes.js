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
      const organizationId = new mongoose.Types.ObjectId(
        req.user.organizationId
      );

      const [
        hardwareCount,
        softwareCount,
        coreLicensesCount,
        activeLicenses,
        expiredLicenses,
        usersCount,
        hardwareValuationAgg,
        softwareValuationAgg,
      ] = await Promise.all([
        HardwareAsset.countDocuments({ organizationId }),
        SoftwareAsset.countDocuments({ organizationId }),
        CoreCompanyLicense.countDocuments({ organizationId }),
        CoreCompanyLicense.countDocuments({
          organizationId,
          status: "Active",
        }),
        CoreCompanyLicense.countDocuments({
          organizationId,
          status: "Expired",
        }),
        User.countDocuments({ organizationId }),

        // Hardware valuation
        HardwareAsset.aggregate([
          { $match: { organizationId } },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $ifNull: ["$assetCost.baseTotalAmount", 0],
                },
              },
            },
          },
        ]),

        // Software valuation
        SoftwareAsset.aggregate([
          { $match: { organizationId } },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $ifNull: ["$assetCost.baseTotalAmount", 0],
                },
              },
            },
          },
        ]),
      ]);

      const hardwareValuation = hardwareValuationAgg[0]?.total || 0;
      const softwareValuation = softwareValuationAgg[0]?.total || 0;

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
      console.error("Stats error:", error);
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
      const in90 = new Date();
      in90.setDate(today.getDate() + 90);

      const softwares = await SoftwareAsset.find(
        {
          organizationId,
          DOE: { $gte: today, $lte: in90 },
        },
        {
          assetName: 1,
          DOE: 1,
          assetQuantity: 1,
          "assetCost.baseAmount": 1,
          "assetCost.currency": 1,
        }
      )
        .sort({ DOE: 1 })
        .lean();

      const critical = [];
      const warning = [];
      const normal = [];

      for (const s of softwares) {
        const daysLeft = Math.ceil(
          (new Date(s.DOE) - today) / 86400000
        );

        const item = {
          name: s.assetName,
          expiryDate: s.DOE,
          daysLeft,
          quantity: s.assetQuantity || 0,
          cost: s.assetCost?.baseAmount || 0,
          currency: s.assetCost?.currency || "USD",
        };

        if (daysLeft <= 30) {
          item.urgency = "critical";
          critical.push(item);
        } else if (daysLeft <= 60) {
          item.urgency = "warning";
          warning.push(item);
        } else {
          item.urgency = "normal";
          normal.push(item);
        }
      }

      res.json({
        critical,
        warning,
        normal,
        totalExpiring: softwares.length,
      });
    } catch (error) {
      console.error("Upcoming expiry error:", error);
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

      const softwares = await SoftwareAsset.find(
        { organizationId },
        {
          assetName: 1,
          assetQuantity: 1,
          inUse: 1,
        }
      ).lean();

      const labels = [];
      const totalLicenses = [];
      const inUseArr = [];
      const available = [];
      const utilization = [];

      for (const s of softwares) {
        const total = s.assetQuantity || 0;
        const used = s.inUse || 0;
        const avail = total - used;
        const percent = total === 0 ? 0 : (used / total) * 100;

        labels.push(s.assetName);
        totalLicenses.push(total);
        inUseArr.push(used);
        available.push(avail);
        utilization.push(Number(percent.toFixed(2)));
      }

      res.json({
        labels,
        totalLicenses,
        inUse: inUseArr,
        available,
        utilization,
      });
    } catch (error) {
      console.error("License utilization error:", error);
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

      const result = await HardwareAsset.aggregate([
        {
          $match: {
            organizationId,
            DOE: { $exists: true, $ne: null }
          }
        },
        {
          $facet: {
            overdue: [
              { $match: { DOE: { $lt: today } } },
              {
                $addFields: {
                  daysOverdue: {
                    $floor: {
                      $divide: [
                        { $subtract: [today, "$DOE"] },
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
                  DOE: { $gte: today, $lte: next30Days }
                }
              },
              {
                $addFields: {
                  daysLeft: {
                    $ceil: {
                      $divide: [
                        { $subtract: ["$DOE", today] },
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

      res.json({ success: true, data: result[0] });
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
    console.log(req.user);
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);

const data = await AssetAssignment.aggregate([
  {
    $match: {
      organizationId,
      status: { $regex: /^active$/i }
    }
  },
  {
    $group: {
      _id: {
        departmentId: "$departmentId",
        assetType: { $toLower: "$assetType" }
      },
      total: { $sum: { $ifNull: ["$quantity", 0] } }
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
  {
    $unwind: {
      path: "$department",
      preserveNullAndEmptyArrays: true
    }
  },
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
console.log("Asset distribution data:", data);
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
