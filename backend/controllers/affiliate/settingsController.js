const AffiliateProfile = require("../../models/AffiliateProfile");

const getAffiliateProfileSettings = async (req, res) => {
  try {
    const profile = await AffiliateProfile.findOne({
      userId: req.user.id,
    }).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Affiliate profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        audienceType: profile.audienceType,
        promotionMethod: profile.promotionMethod,
        affiliateCode: profile.affiliateCode,
        referralLink: profile.referralLink,
        status: profile.status,
        notes: profile.notes,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateAffiliateProfileSettings = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      website,
      audienceType,
      promotionMethod,
      notes,
    } = req.body;

    const profile = await AffiliateProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Affiliate profile not found",
      });
    }

    if (fullName !== undefined)
      profile.fullName = fullName;

    if (email !== undefined)
      profile.email = email;

    if (phone !== undefined)
      profile.phone = phone;

    if (website !== undefined)
      profile.website = website;

    if (audienceType !== undefined)
      profile.audienceType = audienceType;

    if (promotionMethod !== undefined)
      profile.promotionMethod = promotionMethod;

    if (notes !== undefined)
      profile.notes = notes;

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Profile settings updated successfully",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAffiliatePayoutSettings = async (req, res) => {
  try {
    const profile = await AffiliateProfile.findOne({
      userId: req.user.id,
    }).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Affiliate profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        payoutMethod: profile.payoutMethod,
        payoutDetails: profile.payoutDetails,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateAffiliatePayoutSettings = async (req, res) => {
  try {
    const {
      payoutMethod,
      payoutDetails,
    } = req.body;

    const profile = await AffiliateProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Affiliate profile not found",
      });
    }

    if (payoutMethod) {
      profile.payoutMethod = payoutMethod;
    }

    if (payoutDetails) {
      profile.payoutDetails = payoutDetails;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Payout settings updated successfully",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAffiliatePreferences = async (req, res) => {
  try {
    const profile = await AffiliateProfile.findOne({
      userId: req.user.id,
    }).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Affiliate profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        isActive: profile.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateAffiliatePreferences = async (req, res) => {
  try {
    const { isActive } = req.body;

    const profile = await AffiliateProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Affiliate profile not found",
      });
    }

    if (typeof isActive === "boolean") {
      profile.isActive = isActive;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: {
        isActive: profile.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  getAffiliateProfileSettings,
  updateAffiliateProfileSettings,

  getAffiliatePayoutSettings,
  updateAffiliatePayoutSettings,

  getAffiliatePreferences,
  updateAffiliatePreferences,
};