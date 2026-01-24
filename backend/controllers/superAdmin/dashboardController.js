const Organization = require("../../models/Organization");
const User = require("../../models/User");
const Subscription = require("../../models/Subscription");

// TEMP pricing config (move to DB/config later)
const PLAN_PRICING = {
  basic: 999,
  pro: 1999,
};

const getOverview = async (req, res) => {
  try {
    /* ===============================
       PLATFORM SNAPSHOT
    =============================== */
    const [
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ status: "active" }),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
    ]);

    /* ===============================
       SUBSCRIPTION COUNTS
    =============================== */
    const subscriptionCounts = await Subscription.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const subscriptions = {
      trial: 0,
      active: 0,
      expired: 0,
    };

    subscriptionCounts.forEach((item) => {
      if (item._id === "trialing") subscriptions.trial = item.count;
      if (item._id === "active") subscriptions.active = item.count;
      if (item._id === "expired") subscriptions.expired = item.count;
    });

    /* ===============================
       REVENUE (MONTH-WISE)
    =============================== */
    const revenueByMonth = await Subscription.aggregate([
      {
        $match: {
          status: "active",
          plan: { $in: ["basic", "pro"] },
        },
      },
      {
        $addFields: {
          revenue: {
            $cond: [
              { $eq: ["$plan", "basic"] },
              PLAN_PRICING.basic,
              PLAN_PRICING.pro,
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$revenue" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
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
              { $toString: "$_id.year" },
            ],
          },
          total: 1,
        },
      },
    ]);

    /* ===============================
       RESPONSE
    =============================== */
    res.status(200).json({
      success: true,
      data: {
        totalOrganizations,
        activeOrganizations,
        totalUsers,
        activeUsers,
        subscriptions,
        revenueByMonth,
      },
    });
  } catch (error) {
    console.error("Super Admin Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};

module.exports = {
  getOverview,
};
