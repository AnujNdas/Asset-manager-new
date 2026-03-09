const crypto = require("crypto");
const OrganizationInvite = require("../models/OrganizationInvite");

const pricingTiers = require("../config/pricingTiers");
const Subscription = require("../models/Subscription");
const User = require("../models/User");

const createInvite = async (req, res) => {
  try {
    const { role = "user", email, maxUses, expiresInDays = 7 } = req.body;
    const organizationId = req.user.organizationId;

    /* -------------------------
       ADMIN LIMIT ENFORCEMENT
    ------------------------- */

    if (role === "admin") {
      const subscription = await Subscription.findOne({ organizationId });

      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: "No active subscription found"
        });
      }

      const tier = pricingTiers.find(t => t.key === subscription.tier);

      if (!tier) {
        return res.status(500).json({
          success: false,
          message: "Invalid subscription tier configuration"
        });
      }

      const adminLimit = tier.users;

      if (adminLimit !== "unlimited") {
        const adminCount = await User.countDocuments({
          organizationId,
          role: "admin"
        });

        if (adminCount >= adminLimit) {
          return res.status(403).json({
            success: false,
            code: "ADMIN_LIMIT_REACHED",
            message: "Admin user limit reached for your subscription plan",
            limit: adminLimit,
            current: adminCount
          });
        }
      }
    }

    /* -------------------------
       CREATE INVITE
    ------------------------- */

    const inviteToken = crypto.randomBytes(32).toString("hex");

    const invite = await OrganizationInvite.create({
      organizationId,
      inviteToken,
      role,
      email,
      maxUses: maxUses || null,
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      createdBy: req.user.id
    });

    const inviteUrl = `${process.env.FRONTEND_URL}/user/signup?invite=${inviteToken}`;

    return res.status(201).json({
      success: true,
      inviteUrl,
      invite
    });

  } catch (err) {
    console.error("Invite creation error:", err);
    res.status(500).json({ error: "Failed to create invite" });
  }
};
const getInvites = async (req, res) => {
  try {
    const invites = await OrganizationInvite.find({
      organizationId: req.user.organizationId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(invites);
  } catch (err) {
    console.error("Fetch invites error:", err);
    res.status(500).json({ error: "Failed to fetch invites" });
  }
};

const revokeInvite = async (req, res) => {
  try {
    const invite = await OrganizationInvite.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!invite) {
      return res.status(404).json({ error: "Invite not found" });
    }

    invite.expiresAt = new Date();
    await invite.save();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Revoke invite error:", err);
    res.status(500).json({ error: "Failed to revoke invite" });
  }
};


module.exports = { createInvite , revokeInvite , getInvites};
