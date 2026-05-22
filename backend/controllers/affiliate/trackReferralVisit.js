const crypto = require("crypto");

const AffiliateProfile = require("../../models/AffiliateProfile");
const AffiliateReferral = require("../../models/AffiliateReferral");

const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");

const trackReferralVisit = asyncHandler(
  async (req, res, next) => {

    const { ref } = req.body;

    if (!ref) {
      throw new AppError(
        "Affiliate code required",
        400,
        "MISSING_AFFILIATE_CODE"
      );
    }

    // 🔹 Find affiliate
    const affiliate =
      await AffiliateProfile.findOne({
        affiliateCode: ref,
        status: "approved",
        isActive: true,
      });

    if (!affiliate) {
      throw new AppError(
        "Invalid affiliate code",
        404,
        "INVALID_AFFILIATE"
      );
    }

    // 🔹 Generate token
    const referralToken =
      crypto.randomBytes(32).toString("hex");

    // 🔹 Create referral session
    const referral =
      await AffiliateReferral.create({
        affiliateId: affiliate._id,

        affiliateCode:
          affiliate.affiliateCode,

        referralToken,

        ipAddress:
          req.ip || "",

        userAgent:
          req.headers["user-agent"] || "",

        referrerUrl:
          req.headers.referer || "",

        landingPage:
          req.headers.origin || "",
      });

    // 🔹 Save secure cookie
    res.cookie(
      "affiliate_ref",
      referralToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        maxAge:
          1000 * 60 * 60 * 24 * 30,
      }
    );

    // 🔹 Increment click count
    await AffiliateProfile.updateOne(
      { _id: affiliate._id },
      {
        $inc: {
          totalClicks: 1,
        },
      }
    );

    return res.status(200).json({
      success: true,

      message:
        "Referral tracked successfully",
    });
  }
);
module.exports = {trackReferralVisit};