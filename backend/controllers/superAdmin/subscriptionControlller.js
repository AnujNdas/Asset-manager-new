const Subscription = require("../../models/Subscription");
const Organization = require("../../models/Organization");
const AffiliateReferral = require("../../models/AffiliateReferral");
const AffiliateProfile = require("../../models/AffiliateProfile");


/**
 * ============================================================
 * GET ALL SUBSCRIPTION DATA FOR SUPER ADMIN
 * ============================================================
 *
 * Returns:
 *
 * Subscription
 *      ↓
 * Organization
 *      ↓
 * Affiliate Referral
 *      ↓
 * Affiliate Profile
 *
 * Endpoint:
 *
 * GET /api/super-admin/subscriptions
 *
 * ============================================================
 */

const getSuperAdminSubscriptions = async (req, res) => {

  try {

    /*
     * ========================================================
     * 1. GET SUBSCRIPTIONS
     * ========================================================
     */

    const subscriptions = await Subscription.find()
      .sort({ createdAt: -1 })
      .lean();


    /*
     * ========================================================
     * 2. GET ORGANIZATIONS
     * ========================================================
     */

    const organizationIds = subscriptions
      .map(subscription => subscription.organizationId)
      .filter(Boolean);


    const organizations = await Organization.find({
      _id: { $in: organizationIds }
    })
      .select(
        "_id name orgCode status organizationType country city officeLocation currency createdAt updatedAt"
      )
      .lean();


    /*
     * ========================================================
     * 3. CREATE ORGANIZATION MAP
     * ========================================================
     */

    const organizationMap = new Map();

    organizations.forEach(organization => {

      organizationMap.set(
        organization._id.toString(),
        organization
      );

    });


    /*
     * ========================================================
     * 4. GET AFFILIATE REFERRALS
     * ========================================================
     *
     * We primarily match by organizationId because your
     * current referral documents already contain organizationId.
     *
     * subscriptionId is also available and can be used when
     * it has been correctly populated.
     *
     * ========================================================
     */

    const referralOrganizationIds = organizationIds;


    const referrals = await AffiliateReferral.find({
      organizationId: {
        $in: referralOrganizationIds
      }
    })
      .sort({ createdAt: -1 })
      .lean();


    /*
     * ========================================================
     * 5. CREATE REFERRAL MAP
     * ========================================================
     *
     * One organization may technically have multiple referral
     * records.
     *
     * For this first controller we select the most recent one.
     *
     * ========================================================
     */

    const referralMap = new Map();

    referrals.forEach(referral => {

      if (!referral.organizationId) {
        return;
      }

      const organizationId =
        referral.organizationId.toString();


      if (!referralMap.has(organizationId)) {

        referralMap.set(
          organizationId,
          referral
        );

      }

    });


    /*
     * ========================================================
     * 6. GET AFFILIATE PROFILES
     * ========================================================
     */

    const affiliateIds = referrals
      .map(referral => referral.affiliateId)
      .filter(Boolean);


    const affiliates = await AffiliateProfile.find({
      _id: {
        $in: affiliateIds
      }
    })
      .select(
        "_id userId affiliateCode status fullName email totalClicks totalReferrals totalConversions pendingEarnings approvedEarnings paidEarnings totalEarnings payoutMethod isActive referralLink lastReferralAt lastPayoutAt createdAt updatedAt"
      )
      .lean();


    /*
     * ========================================================
     * 7. CREATE AFFILIATE MAP
     * ========================================================
     */

    const affiliateMap = new Map();

    affiliates.forEach(affiliate => {

      affiliateMap.set(
        affiliate._id.toString(),
        affiliate
      );

    });


    /*
     * ========================================================
     * 8. COMBINE EVERYTHING
     * ========================================================
     */

    const result = subscriptions.map(subscription => {

      const organization =
        organizationMap.get(
          subscription.organizationId?.toString()
        ) || null;


      const referral =
        referralMap.get(
          subscription.organizationId?.toString()
        ) || null;


      const affiliate =
        referral?.affiliateId
          ? affiliateMap.get(
              referral.affiliateId.toString()
            ) || null
          : null;


      return {

        subscription,

        organization,

        referral,

        affiliate

      };

    });


    /*
     * ========================================================
     * 9. CALCULATE SUMMARY
     * ========================================================
     */

    const summary = {

      totalSubscriptions:
        subscriptions.length,


      activeSubscriptions:
        subscriptions.filter(
          item => item.status === "active"
        ).length,


      trialSubscriptions:
        subscriptions.filter(
          item =>
            item.status === "trialing" ||
            item.tier === "trial"
        ).length,


      monthlySubscriptions:
        subscriptions.filter(
          item =>
            item.billingCycle === "monthly"
        ).length,


      yearlySubscriptions:
        subscriptions.filter(
          item =>
            item.billingCycle === "yearly"
        ).length,


      cancelledSubscriptions:
        subscriptions.filter(
          item =>
            item.status === "cancelled"
        ).length,


      expiredSubscriptions:
        subscriptions.filter(
          item =>
            item.status === "expired"
        ).length,


      pastDueSubscriptions:
        subscriptions.filter(
          item =>
            item.status === "past_due"
        ).length,


      pausedSubscriptions:
        subscriptions.filter(
          item =>
            item.status === "paused"
        ).length

    };


    /*
     * ========================================================
     * 10. SEND RESPONSE
     * ========================================================
     */

    return res.status(200).json({

      success: true,

      summary,

      count: result.length,

      subscriptions: result

    });


  } catch (error) {

    console.error(
      "SUPER ADMIN SUBSCRIPTION ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch subscription data.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined

    });

  }

};


module.exports = {
  getSuperAdminSubscriptions
};