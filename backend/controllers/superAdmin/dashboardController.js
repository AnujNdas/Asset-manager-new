const Organization = require("../../models/Organization");
const User = require("../../models/User");
const Subscription = require("../../models/Subscription");
const AffiliateProfile = require("../../models/AffiliateProfile")
// TEMP pricing config (move to DB/config later)
const PLAN_PRICING = {
  basic: 999,
  pro: 1999,
};

const getOverview = async (req, res) => {
  try {
    /* =====================================================
       ACTIVE USER WINDOW
    ===================================================== */

    const activeSince = new Date();
    activeSince.setDate(activeSince.getDate() - 30);


    /* =====================================================
       PLATFORM SNAPSHOT
    ===================================================== */

    const [
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      activeUsers,
      totalAffiliates,
      pendingAffiliates,
    ] = await Promise.all([

      Organization.countDocuments(),

      Organization.countDocuments({
        status: "active",
      }),

      User.countDocuments(),

      User.countDocuments({
        role: { $ne: "affiliate" },
        lastActive: {
          $gte: activeSince,
        },
      }),

      User.countDocuments({
        role: "affiliate",
      }),

      AffiliateProfile.countDocuments({
        status: "pending",
      }),
    ]);


    /* =====================================================
       SUBSCRIPTION COUNTS
    ===================================================== */

    const subscriptionCounts =
      await Subscription.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]);


    const subscriptions = {
      trialing: 0,
      active: 0,
      paused: 0,
      pastDue: 0,
      cancelled: 0,
      expired: 0,
    };


    subscriptionCounts.forEach((item) => {

      switch (item._id) {

        case "trialing":
          subscriptions.trialing = item.count;
          break;

        case "active":
          subscriptions.active = item.count;
          break;

        case "paused":
          subscriptions.paused = item.count;
          break;

        case "past_due":
          subscriptions.pastDue = item.count;
          break;

        case "cancelled":
          subscriptions.cancelled = item.count;
          break;

        case "expired":
          subscriptions.expired = item.count;
          break;

      }

    });


    /* =====================================================
       REVENUE
    ===================================================== */

    const revenueByMonth =
      await Subscription.aggregate([

        {
          $match: {
            status: "active",
            lastPaymentAmount: {
              $gt: 0,
            },
          },
        },

        {
          $group: {

            _id: {
              year: {
                $year: "$lastPaymentDate",
              },

              month: {
                $month: "$lastPaymentDate",
              },
            },

            total: {
              $sum: "$lastPaymentAmount",
            },

          },
        },

        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },

        {
          $project: {

            _id: 0,

            month: {
              $concat: [

                {
                  $arrayElemAt: [
                    [
                      "",
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ],
                    "$_id.month",
                  ],
                },

                " ",

                {
                  $toString: "$_id.year",
                },

              ],
            },

            total: 1,
          },
        },

      ]);


    /* =====================================================
       TOTAL REVENUE
    ===================================================== */

    const revenueSummary =
      await Subscription.aggregate([

        {
          $match: {
            status: {
              $in: [
                "active",
                "cancelled",
                "expired",
              ],
            },

            lastPaymentAmount: {
              $gt: 0,
            },
          },
        },

        {
          $group: {

            _id: null,

            totalRevenue: {
              $sum: "$lastPaymentAmount",
            },

            monthlyRecurringRevenue: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$billingCycle",
                      "monthly",
                    ],
                  },
                  "$planPrice",
                  0,
                ],
              },
            },

          },
        },

      ]);


    const revenue = {

      totalRevenue:
        revenueSummary[0]?.totalRevenue || 0,

      monthlyRecurringRevenue:
        revenueSummary[0]?.monthlyRecurringRevenue || 0,

      revenueByMonth,

    };


    /* =====================================================
       ORGANIZATION TYPES
    ===================================================== */

    const organizationTypes =
      await Organization.aggregate([

        {
          $group: {

            _id: "$organizationType",

            count: {
              $sum: 1,
            },

          },
        },

        {
          $sort: {
            count: -1,
          },
        },

      ]);


    /* =====================================================
       BILLING CYCLES
    ===================================================== */

    const billingCycles =
      await Subscription.aggregate([

        {
          $match: {
            status: "active",
          },
        },

        {
          $group: {

            _id: "$billingCycle",

            count: {
              $sum: 1,
            },

          },
        },

      ]);


    /* =====================================================
       EXPIRING SUBSCRIPTIONS
       NEXT 7 DAYS
    ===================================================== */

    const now = new Date();

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(
      sevenDaysLater.getDate() + 7
    );


    const expiringSubscriptions =
      await Subscription.countDocuments({

        status: "active",

        currentEnd: {
          $gte: now,
          $lte: sevenDaysLater,
        },

      });


    /* =====================================================
       RECENT ORGANIZATIONS
    ===================================================== */

    const recentOrganizations =
      await Organization.find()

        .sort({
          createdAt: -1,
        })

        .limit(5)

        .select(
          "name orgCode organizationType status createdAt"
        )

        .lean();


    /* =====================================================
       RESPONSE
    ===================================================== */

    res.status(200).json({

      success: true,

      data: {

        totalOrganizations,

        activeOrganizations,

        totalUsers,

        activeUsers,

        totalAffiliates,

        pendingAffiliates,

        subscriptions,

        revenue,

        organizationTypes,

        billingCycles,

        expiringSubscriptions,

        recentOrganizations,

      },

    });

  } catch (error) {

    console.error(
      "Super Admin Dashboard Error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to load dashboard data",

    });

  }
};

module.exports = {
  getOverview,
};
