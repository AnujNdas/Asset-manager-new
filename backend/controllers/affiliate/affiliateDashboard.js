const AffiliateProfile = require("../models/AffiliateProfile");
const AffiliateReferral = require("../models/AffiliateReferral");
const AffiliateCommissionPayment = require("../models/AffiliateCommissionPayment");
const AffiliatePaymentTicket = require("../models/AffiliatePaymentTicket");
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

    /* =====================================================
       AFFILIATE PROFILE
    ===================================================== */

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

    const affiliateId = affiliate._id;


    /* =====================================================
       DATE RANGES
    ===================================================== */

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );


    /* =====================================================
       RECENT REFERRALS
    ===================================================== */

    const recentReferrals =
      await AffiliateReferral.find({
        affiliateId,
      })
        .populate({
          path: "referredUserId",
          select: "username email createdAt",
        })
        .populate({
          path: "organizationId",
          select: "name orgCode",
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();


    /* =====================================================
       COMMISSION PAYMENTS
       SOURCE OF TRUTH FOR AFFILIATE EARNINGS
    ===================================================== */

    const commissionPayments =
      await AffiliateCommissionPayment.find({
        affiliateId,
      })
        .populate({
          path: "organizationId",
          select: "name orgCode",
        })
        .sort({ createdAt: -1 })
        .lean();


    /* =====================================================
       TOTAL EARNINGS
    ===================================================== */

    const totalEarnings =
      commissionPayments.reduce(
        (sum, payment) =>
          sum +
          Number(payment.commissionAmount || 0),
        0
      );


    /* =====================================================
       PENDING EARNINGS
       pending + approved
    ===================================================== */

    const pendingEarnings =
      commissionPayments
        .filter(
          (payment) =>
            payment.status === "pending" ||
            payment.status === "approved"
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(payment.commissionAmount || 0),
          0
        );


    /* =====================================================
       APPROVED EARNINGS
    ===================================================== */

    const approvedEarnings =
      commissionPayments
        .filter(
          (payment) =>
            payment.status === "approved"
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(payment.commissionAmount || 0),
          0
        );


    /* =====================================================
       PAID EARNINGS
    ===================================================== */

    const paidEarnings =
      commissionPayments
        .filter(
          (payment) =>
            payment.status === "paid"
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(payment.commissionAmount || 0),
          0
        );


    /* =====================================================
       REJECTED EARNINGS
    ===================================================== */

    const rejectedEarnings =
      commissionPayments
        .filter(
          (payment) =>
            payment.status === "rejected"
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(payment.commissionAmount || 0),
          0
        );


    /* =====================================================
       COMMISSION COUNT
    ===================================================== */

    const commissionCount =
      commissionPayments.length;


    /* =====================================================
       AVERAGE COMMISSION
    ===================================================== */

    const averageCommission =
      commissionCount > 0
        ? totalEarnings / commissionCount
        : 0;


    /* =====================================================
       TODAY'S COMMISSIONS
    ===================================================== */

    const todaysCommissions =
      commissionPayments.filter((payment) => {
        const createdAt =
          new Date(payment.createdAt);

        return createdAt >= startOfDay;
      });


    const earningsToday =
      todaysCommissions.reduce(
        (sum, payment) =>
          sum +
          Number(payment.commissionAmount || 0),
        0
      );


    const commissionsToday =
      todaysCommissions.length;


    /* =====================================================
       THIS MONTH'S COMMISSIONS
    ===================================================== */

    const monthlyCommissions =
      commissionPayments.filter((payment) => {
        const createdAt =
          new Date(payment.createdAt);

        return createdAt >= startOfMonth;
      });


    const earningsThisMonth =
      monthlyCommissions.reduce(
        (sum, payment) =>
          sum +
          Number(payment.commissionAmount || 0),
        0
      );


    const commissionsThisMonth =
      monthlyCommissions.length;


    /* =====================================================
       REFERRAL STATS
    ===================================================== */

    const conversionRate =
      affiliate.totalClicks > 0
        ? (
            (affiliate.totalConversions /
              affiliate.totalClicks) *
            100
          ).toFixed(2)
        : 0;


    /* =====================================================
       TODAY'S REFERRAL ACTIVITY
    ===================================================== */

    const [
      clicksToday,
      referralsToday,
      conversionsToday,
    ] = await Promise.all([
      AffiliateReferral.countDocuments({
        affiliateId,

        createdAt: {
          $gte: startOfDay,
        },
      }),

      AffiliateReferral.countDocuments({
        affiliateId,

        status: "signed_up",

        signupAt: {
          $gte: startOfDay,
        },
      }),

      AffiliateReferral.countDocuments({
        affiliateId,

        status: "converted",

        convertedAt: {
          $gte: startOfDay,
        },
      }),
    ]);


    /* =====================================================
       RECENT EARNINGS
    ===================================================== */

    const recentEarnings =
      commissionPayments
        .slice(0, 8)
        .map((payment) => ({
          id: payment._id,

          organizationName:
            payment.organizationId?.name ||
            "Unknown Organization",

          organizationCode:
            payment.organizationId?.orgCode ||
            "",

          planName:
            payment.planName,

          billingCycle:
            payment.billingCycle,

          commissionType:
            payment.commissionType,

          paymentAmount:
            payment.paymentAmount,

          paymentCurrency:
            payment.paymentCurrency,

          commissionRate:
            payment.commissionRate,

          commissionAmount:
            payment.commissionAmount,

          status:
            payment.status,

          createdAt:
            payment.createdAt,

          paidAt:
            payment.paidAt,
        }));


    /* =====================================================
       PAYOUT TICKETS
    ===================================================== */

    const payoutTickets =
      await AffiliatePaymentTicket.find({
        affiliateId,
      })
        .sort({ createdAt: -1 })
        .lean();


    const pendingTickets =
      payoutTickets.filter(
        (ticket) =>
          ticket.status === "pending"
      ).length;


    const processingTickets =
      payoutTickets.filter(
        (ticket) =>
          ticket.status === "processing"
      ).length;


    const resolvedTickets =
      payoutTickets.filter(
        (ticket) =>
          ticket.status === "resolved" ||
          ticket.status === "paid"
      ).length;


    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      /* =================================================
         AFFILIATE
      ================================================= */

      affiliate: {
        _id: affiliate._id,

        fullName:
          affiliate.fullName,

        email:
          affiliate.email,

        affiliateCode:
          affiliate.affiliateCode,

        referralLink:
          affiliate.referralLink,

        status:
          affiliate.status,

        totalClicks:
          affiliate.totalClicks,

        totalReferrals:
          affiliate.totalReferrals,

        totalConversions:
          affiliate.totalConversions,

        payoutMethod:
          affiliate.payoutMethod,

        isActive:
          affiliate.isActive,

        createdAt:
          affiliate.createdAt,
      },


      /* =================================================
         REFERRAL STATS
      ================================================= */

      stats: {
        conversionRate,

        clicksToday,

        referralsToday,

        conversionsToday,

        totalReferrals:
          affiliate.totalReferrals,

        totalConversions:
          affiliate.totalConversions,
      },


      /* =================================================
         EARNINGS
      ================================================= */

      earnings: {
        totalEarnings,

        pendingEarnings,

        approvedEarnings,

        paidEarnings,

        rejectedEarnings,

        earningsToday,

        commissionsToday,

        earningsThisMonth,

        commissionsThisMonth,

        commissionCount,

        averageCommission,

        currency:
          commissionPayments[0]
            ?.paymentCurrency || "USD",
      },


      /* =================================================
         PAYOUTS
      ================================================= */

      payouts: {
        pendingTickets,

        processingTickets,

        resolvedTickets,
      },


      /* =================================================
         RECENT DATA
      ================================================= */

      recentReferrals,

      recentEarnings,
    });
  }
);

module.exports = {
  getAffiliateDashboard,
};