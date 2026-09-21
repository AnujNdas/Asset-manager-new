const Organization = require("../../models/Organization");
const User = require("../../models/User");
const AssetInstance = require("../models/AssetInstance");
/* ================= GET ALL (WITH USER COUNT) ================= */
const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.aggregate([
      /* =====================================================
         USERS
      ===================================================== */

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "organizationId",
          as: "users"
        }
      },

      /* =====================================================
         ASSET INSTANCES
         
         Count:
         - Total instances
         - Hardware instances
         - Software instances
      ===================================================== */

      {
        $lookup: {
          from: "assetinstances",

          let: {
            orgId: "$_id"
          },

          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    "$organizationId",
                    "$$orgId"
                  ]
                }
              }
            },

            {
              $group: {
                _id: null,

                total: {
                  $sum: 1
                },

                hardware: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$assetType",
                          "hardware"
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },

                software: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$assetType",
                          "software"
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],

          as: "assetStats"
        }
      },

      /* =====================================================
         COUNTS
      ===================================================== */

      {
        $addFields: {
          userCount: {
            $size: "$users"
          },

          assetCount: {
            $ifNull: [
              {
                $arrayElemAt: [
                  "$assetStats.total",
                  0
                ]
              },
              0
            ]
          },

          hardwareAssetCount: {
            $ifNull: [
              {
                $arrayElemAt: [
                  "$assetStats.hardware",
                  0
                ]
              },
              0
            ]
          },

          softwareAssetCount: {
            $ifNull: [
              {
                $arrayElemAt: [
                  "$assetStats.software",
                  0
                ]
              },
              0
            ]
          },

          /* =================================================
             EFFECTIVE ORGANIZATION STATUS

             If organization has no users,
             force status to inactive.
          ================================================= */

          effectiveStatus: {
            $cond: [
              {
                $eq: [
                  {
                    $size: "$users"
                  },
                  0
                ]
              },
              "inactive",
              "$status"
            ]
          }
        }
      },

      /* =====================================================
         CLEAN RESPONSE
      ===================================================== */

      {
        $project: {
          users: 0,
          assetStats: 0,
          __v: 0,
          status: 0
        }
      },

      /* =====================================================
         NEWEST ORGANIZATIONS FIRST
      ===================================================== */

      {
        $sort: {
          createdAt: -1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: organizations
    });

  } catch (error) {
    console.error(
      "Get Organizations Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Error fetching organizations"
    });
  }
};


/* ================= CREATE ================= */
const createOrganization = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Organization name is required"
      });
    }

    const exists = await Organization.findOne({ name });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Organization already exists"
      });
    }

    const organization = await Organization.create({
      name,
      createdBy: req.user.id, // super-admin
      status: "active"
    });

    res.status(201).json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error("Create Organization Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating organization"
    });
  }
};

/* ================= GET BY ID (WITH USER COUNT) ================= */
const getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id).lean();

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    const userCount = await User.countDocuments({
      organizationId: organization._id
    });

    res.status(200).json({
      success: true,
      data: {
        ...organization,
        userCount
      }
    });
  } catch (error) {
    console.error("Get Organization Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching organization"
    });
  }
};

/* ================= TOGGLE STATUS ================= */
const toggleOrganizationStatus = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    organization.status =
      organization.status === "active" ? "suspended" : "active";

    await organization.save();

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error("Update Organization Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update organization status"
    });
  }
};
const getOrganizationUsers = async (req, res) => {
  try {
    const users = await User.find({
      organizationId: req.params.id
    })
      .select("username email role status createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Get Organization Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};

module.exports = {
  getAllOrganizations,
  createOrganization,
  getOrganizationById,
  toggleOrganizationStatus,
  getOrganizationUsers
};
