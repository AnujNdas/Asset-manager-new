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
    try {
      const allowedFields = [
        "fullName",
        "profileTitle",
        "phone",

        "organizationName",
        "organizationType",
        "department",
        "designation",
        "workEmail",

        "country",
        "city",
        "officeLocation",
      ];

      const updateData = {};

      // text fields
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // 🖼 Avatar uploaded via CloudinaryStorage
      if (req.file?.path) {
        // delete old image if exists
        if (user.avatar?.publicId) {
          await cloudinary.uploader.destroy(user.avatar.publicId);
        }

        updateData.avatar = {
          url: req.file.path,
          publicId: req.file.filename,
        };
      }

      // ✅ Explicit onboarding completion
      if (req.body.onboardingCompleted === "true") {
        updateData.onboardingCompleted = true;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password");

      res.json({
        success: true,
        user: updatedUser,
      });
    } catch (err) {
      console.error("Update profile error:", err);
      res.status(500).json({ error: "Profile update failed" });
    }
  }
);
// Get logged-in user's profile
router.get("/me", authenticateToken(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});
 module.exports = router;