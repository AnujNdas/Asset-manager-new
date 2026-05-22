const AffiliateProfile = require("../../models/AffiliateProfile");
const AffiliateReferral = require("../../models/AffiliateReferral");

const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");

const getAffiliateDashboard = asyncHandler(
  async (req, res, next) => {

    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(
        "Unauthorized",
        401,
        "UNAUTHORIZED"
      );
    }

    /* ===============================
       AFFILIATE PROFILE
    =============================== */

    const affiliate =
      await AffiliateProfile.findOne({
        userId,
      }).lean();

    if (!affiliate) {
      throw new AppError(
        "Affiliate profile not found",
        404,
        "AFFILIATE_NOT_FOUND"
      );
    }

    /* ===============================
       RECENT REFERRALS
    =============================== */

    const recentReferrals =
      await AffiliateReferral.find({
        affiliateId: affiliate._id,
      })
        .populate({
          path: "referredUserId",
          select:
            "username email createdAt",
        })
        .populate({
          path: "organizationId",
          select:
            "name orgCode",
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    /* ===============================
       STATS
    =============================== */

    const conversionRate =
      affiliate.totalClicks > 0
        ? (
            (affiliate.totalConversions /
              affiliate.totalClicks) *
            100
          ).toFixed(2)
        : 0;

    /* ===============================
       TODAY STATS
    =============================== */

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      clicksToday,
      referralsToday,
      conversionsToday,
    ] = await Promise.all([
      AffiliateReferral.countDocuments({
        affiliateId: affiliate._id,
        createdAt: {
          $gte: startOfDay,
        },
      }),

      AffiliateReferral.countDocuments({
        affiliateId: affiliate._id,
        status: "signed_up",
        signupAt: {
          $gte: startOfDay,
        },
      }),

      AffiliateReferral.countDocuments({
        affiliateId: affiliate._id,
        status: "converted",
        convertedAt: {
          $gte: startOfDay,
        },
      }),
    ]);

    /* ===============================
       RESPONSE
    =============================== */

    return res.status(200).json({
      success: true,

      affiliate: {
        _id: affiliate._id,

        fullName: affiliate.fullName,
        email: affiliate.email,

        affiliateCode:
          affiliate.affiliateCode,

        referralLink:
          affiliate.referralLink,

        status: affiliate.status,

        totalClicks:
          affiliate.totalClicks,

        totalReferrals:
          affiliate.totalReferrals,

        totalConversions:
          affiliate.totalConversions,

        pendingEarnings:
          affiliate.pendingEarnings,

        approvedEarnings:
          affiliate.approvedEarnings,

        paidEarnings:
          affiliate.paidEarnings,

        totalEarnings:
          affiliate.totalEarnings,

        payoutMethod:
          affiliate.payoutMethod,

        isActive:
          affiliate.isActive,

        createdAt:
          affiliate.createdAt,
      },

      stats: {
        conversionRate,

        clicksToday,

        referralsToday,

        conversionsToday,
      },

      recentReferrals,
    });
  }
);

module.exports = {
  getAffiliateDashboard,
};