// controllers/affiliate/applyAffiliate.js

const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const AffiliateProfile = require("../../models/AffiliateProfile");

const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");

/* =========================================
   GENERATE AFFILIATE CODE
========================================= */
const generateAffiliateCode = (name) => {
  const clean = name
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 5);

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `AFF-${clean}${random}`;
};

/* =========================================
   APPLY AS AFFILIATE
========================================= */
const applyAffiliate = asyncHandler(
  async (req, res, next) => {

    const {
      fullName,
      email,
      password,
      phone,
      website,
      audienceType,
      promotionMethod,
    } = req.body;

    /* =============================
       VALIDATION
    ============================== */

    if (!fullName || !email || !password) {
      throw new AppError(
        "Full name, email and password are required",
        400,
        "VALIDATION_ERROR"
      );
    }

    if (password.length < 6) {
      throw new AppError(
        "Password must be at least 6 characters",
        400,
        "WEAK_PASSWORD"
      );
    }

    /* =============================
       CHECK EXISTING USER
    ============================== */

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      throw new AppError(
        "Email already registered",
        409,
        "EMAIL_EXISTS"
      );
    }

    /* =============================
       HASH PASSWORD
    ============================== */

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    /* =============================
       CREATE USER
    ============================== */

    const user = await User.create({
      username: fullName,
      fullName,

      email: email.toLowerCase(),

      password: hashedPassword,

      role: "affiliate",

      organizationId: null,

      onboardingCompleted: true,
    });

    /* =============================
       GENERATE CODE
    ============================== */

    let affiliateCode =
      generateAffiliateCode(fullName);

    // prevent collision
    let exists = await AffiliateProfile.findOne({
      affiliateCode,
    });

    while (exists) {
      affiliateCode =
        generateAffiliateCode(fullName);

      exists = await AffiliateProfile.findOne({
        affiliateCode,
      });
    }

    /* =============================
       CREATE PROFILE
    ============================== */

    const affiliateProfile =
      await AffiliateProfile.create({
        userId: user._id,

        affiliateCode,

        fullName,

        email: email.toLowerCase(),

        phone: phone || "",

        website: website || "",

        audienceType:
          audienceType || "other",

        promotionMethod:
          promotionMethod || "",

        referralLink:
          `${process.env.FRONTEND_URL}/user/signup?ref=${affiliateCode}`,

        status: "pending",
      });

    /* =============================
       RESPONSE
    ============================== */

    res.status(201).json({
      success: true,

      message:
        "Affiliate application submitted successfully",

      data: {
        affiliateId: affiliateProfile._id,

        affiliateCode,

        status:
          affiliateProfile.status,
      },
    });
  }
);
module.exports = { applyAffiliate };