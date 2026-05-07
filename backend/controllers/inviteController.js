const crypto = require("crypto");

const OrganizationInvite = require("../Models/OrganizationInvite");
const Subscription = require("../Models/Subscription");
const User = require("../Models/User");

const { pricingTiers } = require("../Config/pricing");

// ✅ YOUR EXISTING BREVO UTILITY
const sendBrevoEmail = require("../utils/sendBrevoEmail");

const createInvite = async (req, res, next) => {
  try {
    const { organizationId, id: userId } = req.user;

    if (!organizationId || !userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    let {
      role = "user",
      email,
      maxUses,
      expiresInDays = 7
    } = req.body;

    /* ================= VALIDATION ================= */

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    email = email.trim().toLowerCase();

    if (expiresInDays <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiry duration"
      });
    }

    /* ================= USER EXISTS ================= */

    const existingUser = await User.findOne({
      organizationId,
      email
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists in organization"
      });
    }

    /* ================= ACTIVE INVITE CHECK ================= */

    const existingInvite = await OrganizationInvite.findOne({
      organizationId,
      email,
      status: "active"
    });

    if (existingInvite) {
      return res.status(409).json({
        success: false,
        message: "Active invite already exists for this email"
      });
    }

    /* ================= ADMIN LIMIT ================= */

    if (role === "admin") {
      const subscription = await Subscription.findOne({
        organizationId
      });

      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: "No active subscription found"
        });
      }

      const tier = pricingTiers.find(
        (t) => t.key === subscription.tier
      );

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
            message: "Admin user limit reached",
            limit: adminLimit,
            current: adminCount
          });
        }
      }
    }

    /* ================= CREATE TOKEN ================= */

    const inviteToken = crypto
      .randomBytes(32)
      .toString("hex");

    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000
    );

    /* ================= SAVE INVITE ================= */

    const invite = await OrganizationInvite.create({
      organizationId,
      inviteToken,
      role,
      email,
      maxUses: maxUses || null,
      expiresAt,
      createdBy: userId,
      status: "active"
    });

    /* ================= INVITE URL ================= */

    const inviteUrl =
      `${process.env.FRONTEND_URL}/user/signup?invite=${inviteToken}`;

    /* ================= SEND EMAIL ================= */

    await sendBrevoEmail(
      email,
      "You're Invited to Join Asset Manager",
      `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        
        <h2 style="color:#222831;">
          Organization Invitation
        </h2>

        <p>
          You have been invited to join
          <strong>Asset Manager</strong>
          as a <strong>${role}</strong>.
        </p>

        <p>
          Click the button below to accept the invitation:
        </p>

        <a
          href="${inviteUrl}"
          style="
            display:inline-block;
            margin-top:12px;
            padding:12px 20px;
            background:#948979;
            color:#222831;
            text-decoration:none;
            border-radius:8px;
            font-weight:bold;
          "
        >
          Accept Invitation
        </a>

        <p style="margin-top:20px; color:#666;">
          This invitation expires in ${expiresInDays} day(s).
        </p>

      </div>
      `
    );

    return res.status(201).json({
      success: true,
      message: "Invite created and email sent successfully",
      data: {
        invite
      }
    });

  } catch (error) {
    console.error("CREATE INVITE ERROR:", error);
    return next(error);
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
