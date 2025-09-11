const express = require("express");
const authenticateToken = require("../Middleware/Authentication-token")
const User = require("../models/User");
const router = express.Router();

// Update user profile
router.put("/update", authenticateToken(), async (req, res) => {
  
  console.log("Authenticated user:", req.user);
  try {
    const allowedFields = [
      "name",
      "bio",
      "email",
      "phone",
      "country",
      "city",
      "postalCode",
      "taxId",
    ];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
