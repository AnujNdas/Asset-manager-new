const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticateToken = require("../Middleware/Authentication-token");
const upload = require("../config/multer");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");
const Organization = require("../models/Organization");
router.put(
  "/onboarding",
  authenticateToken(),
  async (req, res) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      /* ==========================
         USER UPDATE
      ========================== */

      const userFields = [
        "department",
        "designation",
        "workEmail",
      ];

      const userUpdate = {};

      userFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          userUpdate[field] = req.body[field];
        }
      });

      userUpdate.onboardingCompleted = true;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: userUpdate },
        {
          new: true,
          session,
        }
      ).select("-password");

      if (!user) {
        throw new Error("User not found");
      }

      /* ==========================
         ORGANIZATION UPDATE
      ========================== */

/* ==========================
   ORGANIZATION UPDATE
========================== */

const organizationFields = [
  "organizationType",
  "country",
  "city",
  "officeLocation",
  "currency",
];

const organizationUpdate = {};

organizationFields.forEach((field) => {
  if (req.body[field] !== undefined) {
    organizationUpdate[field] = req.body[field];
  }
});

if (req.body.organizationName !== undefined) {
  organizationUpdate.name = req.body.organizationName;
}

organizationUpdate.onboardingCompleted = true;

const organization = await Organization.findByIdAndUpdate(
  user.organizationId,
  { $set: organizationUpdate },
  {
    new: true,
    session,
  }
).select(
  "name orgCode organizationType country city officeLocation currency onboardingCompleted status"
);

if (!organization) {
  throw new Error("Organization not found");
}

      /* ==========================
         COMMIT
      ========================== */

      await session.commitTransaction();
      session.endSession();

res.json({
  success: true,
  user,
  organization,
});
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      console.error("Onboarding error:", err);

      res.status(500).json({
        success: false,
        error: err.message || "Onboarding failed",
      });
    }
  }
);
router.put(
  "/update",
  authenticateToken(),
  upload.single("avatar"),
  async (req, res) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      /* ==========================
         USER UPDATE
      ========================== */

      const userFields = [
        "fullName",
        "profileTitle",
        "phone",
        "department",
        "designation",
        "workEmail",
      ];

      const userUpdate = {};

      userFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          userUpdate[field] = req.body[field];
        }
      });

      const user = await User.findById(req.user.id).session(session);

      if (!user) {
        throw new Error("User not found");
      }

      /* ==========================
         AVATAR
      ========================== */

      if (req.file?.path) {
        if (user.avatar?.publicId) {
          await cloudinary.uploader.destroy(user.avatar.publicId);
        }

        userUpdate.avatar = {
          url: req.file.path,
          publicId: req.file.filename,
        };
      }

      if (req.body.onboardingCompleted === "true") {
        userUpdate.onboardingCompleted = true;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: userUpdate },
        {
          new: true,
          runValidators: true,
          session,
        }
      ).select("-password");

      /* ==========================
         ORGANIZATION UPDATE
      ========================== */

      let updatedOrganization = null;

      const canManageOrganization = [
        "admin",
        "super-admin",
      ].includes(user.role);

      if (canManageOrganization && user.organizationId) {
        const organizationFields = [
          "organizationType",
          "country",
          "city",
          "officeLocation",
          "currency",
        ];

        const organizationUpdate = {};

        organizationFields.forEach((field) => {
          if (req.body[field] !== undefined) {
            organizationUpdate[field] = req.body[field];
          }
        });

        if (req.body.organizationName !== undefined) {
          organizationUpdate.name = req.body.organizationName;
        }

        if (Object.keys(organizationUpdate).length > 0) {
          updatedOrganization =
            await Organization.findByIdAndUpdate(
              user.organizationId,
              {
                $set: organizationUpdate,
              },
              {
                new: true,
                runValidators: true,
                session,
              }
            ).select(
              "name orgCode organizationType country city officeLocation currency onboardingCompleted status"
            );

          if (!updatedOrganization) {
            throw new Error("Organization not found");
          }
        }
      }

      /* ==========================
         COMMIT
      ========================== */

      await session.commitTransaction();
      session.endSession();

      res.json({
        success: true,
        user: updatedUser,
        organization: updatedOrganization,
      });

    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      console.error("Update profile error:", err);

      res.status(500).json({
        success: false,
        error: err.message || "Profile update failed",
      });
    }
  }
);
// Get logged-in user's profile
router.get("/me", authenticateToken(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    let organization = null;

    if (user.organizationId) {
      organization = await Organization.findById(
        user.organizationId
      ).select(
        "name orgCode organizationType country city officeLocation currency onboardingCompleted status"
      );
    }

    res.json({
      success: true,
      user,
      organization,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch user data",
    });
  }
});
 module.exports = router;