const AffiliateProfile = require("../../models/AffiliateProfile");
const AffiliateReferral = require("../../models/AffiliateReferral");
const AffiliateCommissionPayment = require("../../models/AffiliateCommissionPayment")
const getAffiliateEarnings = async (req, res) => {
  try {
    const affiliate = await AffiliateProfile.findOne({
      userId: req.user.id,
    });

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate profile not found",
      });
    }

    /* =====================================================
       REFERRAL DATA
    ===================================================== */

    const referrals = await AffiliateReferral.find({
      affiliateId: affiliate._id,
      isFraud: false,
    }).sort({ createdAt: -1 });

    const totalReferrals = referrals.length;

    const convertedReferrals = referrals.filter(
      (referral) => referral.status === "converted"
    );

    const conversionRate =
      totalReferrals > 0
        ? Number(
            (
              (convertedReferrals.length / totalReferrals) *
              100
            ).toFixed(1)
          )
        : 0;


    /* =====================================================
       COMMISSION PAYMENT DATA
       SOURCE OF TRUTH FOR EARNINGS
    ===================================================== */

    const commissionPayments =
      await AffiliateCommissionPayment.find({
        affiliateId: affiliate._id,
      })
        .populate("organizationId", "name orgCode")
        .sort({ createdAt: -1 });


    /* =====================================================
       EARNINGS CALCULATIONS
    ===================================================== */

    const totalEarnings = commissionPayments.reduce(
      (sum, commission) =>
        sum + Number(commission.commissionAmount || 0),
      0
    );

    const pendingEarnings = commissionPayments
      .filter(
        (commission) =>
          commission.status === "pending" ||
          commission.status === "approved"
      )
      .reduce(
        (sum, commission) =>
          sum + Number(commission.commissionAmount || 0),
        0
      );

    const paidEarnings = commissionPayments
      .filter(
        (commission) =>
          commission.status === "paid" ||
          commission.status === "resolved"
      )
      .reduce(
        (sum, commission) =>
          sum + Number(commission.commissionAmount || 0),
        0
      );

    const rejectedEarnings = commissionPayments
      .filter(
        (commission) => commission.status === "rejected"
      )
      .reduce(
        (sum, commission) =>
          sum + Number(commission.commissionAmount || 0),
        0
      );


    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      summary: {
        totalEarnings: Number(totalEarnings.toFixed(2)),

        pendingEarnings: Number(
          pendingEarnings.toFixed(2)
        ),

        paidEarnings: Number(
          paidEarnings.toFixed(2)
        ),

        rejectedEarnings: Number(
          rejectedEarnings.toFixed(2)
        ),

        totalReferrals,

        convertedReferrals:
          convertedReferrals.length,

        conversionRate,
      },

      earnings: commissionPayments.map(
        (commission) => ({
          id: commission._id,

          organizationId:
            commission.organizationId?._id ||
            commission.organizationId,

          organizationName:
            commission.organizationId?.name ||
            "N/A",

          organizationCode:
            commission.organizationId?.orgCode ||
            "N/A",

          planName: commission.planName,

          billingCycle:
            commission.billingCycle,

          commissionType:
            commission.commissionType,

          paymentAmount:
            commission.paymentAmount,

          paymentCurrency:
            commission.paymentCurrency,

          commissionRate:
            commission.commissionRate,

          commissionAmount:
            commission.commissionAmount,

          status:
            commission.status,

          payoutMethod:
            commission.payoutMethod,

          transactionId:
            commission.transactionId,

          paidAt:
            commission.paidAt,

          generatedAt:
            commission.generatedAt,

          createdAt:
            commission.createdAt,
        })
      ),
    });
  } catch (error) {
    console.error(
      "Affiliate earnings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch earnings",
    });
  }
};
module.exports =  {getAffiliateEarnings};