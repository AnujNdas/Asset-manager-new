const AffiliateCommissionPayment = require(
  "../models/AffiliateCommissionPayment"
);

const getAffiliateCommissionPayments = async (req, res) => {
  try {

    const payments =
      await AffiliateCommissionPayment.find({
        status: {
          $in: ["pending", "approved"],
        },
      })

        /* ==========================================
           AFFILIATE
        ========================================== */

        .populate(
          "affiliateId",
          "fullName email affiliateCode payoutMethod payoutDetails"
        )

        /* ==========================================
           ORGANIZATION
        ========================================== */

        .populate(
          "organizationId",
          "name orgCode"
        )

        /* ==========================================
           REFERRED USER
        ========================================== */

        .populate(
          "referredUserId",
          "fullName username email"
        )

        /* ==========================================
           ORIGINAL REFERRAL
        ========================================== */

        .populate(
          "referralId",
          "affiliateCode planName billingCycle paymentAmount paymentCurrency commissionRate commissionAmount convertedAt"
        )

        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });

  } catch (error) {

    console.error(
      "Get affiliate commission payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch affiliate commission payments",
    });
  }
};

module.exports = {
  getAffiliateCommissionPayments,
};