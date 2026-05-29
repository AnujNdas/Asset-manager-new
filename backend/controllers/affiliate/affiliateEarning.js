const AffiliateProfile = require("../../models/AffiliateProfile");
const AffiliateReferral = require("../../models/AffiliateReferral");

const getAffiliateEarnings = async (req, res) => {
  try {

    const affiliate = await AffiliateProfile.findOne({
      userId: req.user.id
    });

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate profile not found"
      });
    }

    const referrals = await AffiliateReferral.find({
      affiliateId: affiliate._id
    })
    .sort({ createdAt: -1 });

    /* =============================
       CALCULATIONS
    ============================== */

    const totalReferrals = referrals.length;

    const convertedReferrals =
      referrals.filter(r => r.status === "converted");

    const totalEarnings =
      convertedReferrals.reduce(
        (sum, r) => sum + (r.commissionAmount || 0),
        0
      );

    const pendingEarnings =
      convertedReferrals
        .filter(r => r.commissionStatus === "pending")
        .reduce(
          (sum, r) => sum + (r.commissionAmount || 0),
          0
        );

    const paidEarnings =
      convertedReferrals
        .filter(r => r.commissionStatus === "paid")
        .reduce(
          (sum, r) => sum + (r.commissionAmount || 0),
          0
        );

    const conversionRate =
      totalReferrals > 0
        ? (
            (convertedReferrals.length / totalReferrals) * 100
          ).toFixed(1)
        : 0;

    /* =============================
       RESPONSE
    ============================== */

    return res.status(200).json({
      success: true,

      summary: {
        totalEarnings,
        pendingEarnings,
        paidEarnings,
        totalReferrals,
        convertedReferrals:
          convertedReferrals.length,
        conversionRate
      },

      earnings: convertedReferrals.map(r => ({
        id: r._id,

        organizationId: r.organizationId,

        planName: r.planName,

        billingCycle: r.billingCycle,

        paymentAmount: r.paymentAmount,

        paymentCurrency: r.paymentCurrency,

        commissionAmount: r.commissionAmount,

        commissionStatus: r.commissionStatus,

        convertedAt: r.convertedAt,

        createdAt: r.createdAt
      }))
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch earnings"
    });

  }
};

module.exports =  {getAffiliateEarnings};