// Middleware/affiliateAuth.js

const jwt = require("jsonwebtoken");

const User = require("../models/User");

const asyncHandler = require("../utils/asyncHandler");

const AppError = require("../utils/AppError");

const affiliateAuth = asyncHandler(
  async (req, res, next) => {

    let token;

    // ✅ Extract bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token =
        req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError(
        "Unauthorized",
        401,
        "UNAUTHORIZED"
      );
    }

    // ✅ Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ✅ Find user
    const user = await User.findById(
      decoded.id
    );

    if (!user) {
      throw new AppError(
        "User not found",
        401,
        "USER_NOT_FOUND"
      );
    }

    // ✅ Only affiliates allowed
    if (user.role !== "affiliate") {
      throw new AppError(
        "Affiliate access only",
        403,
        "FORBIDDEN"
      );
    }

    // ✅ Attach user
    req.user = user;

    next();
  }
);

module.exports = affiliateAuth;