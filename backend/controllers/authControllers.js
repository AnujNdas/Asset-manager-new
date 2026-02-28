const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const axios = require("axios");
const LoginActivity = require("../models/LoginActivity");
const ActivityLog = require("../models/ActivityLog");
const { getClientIp } = require("../utils/ipUtils");
const mongoose = require("mongoose");
const Otp = require("../models/Otp");
const crypto = require("crypto");
const User = require("../models/User");
const Asset = require("../models/Asset");
const AssetAssignment = require("../models/AssetAssignment");
const SupportTicket = require("../models/SupportTicket");
const SoftwareAsset = require("../models/SoftwareAsset");
const Category = require("../models/Category");
const Location = require("../models/Location");
const Status = require("../models/Status");
const Unit = require("../models/Unit");
const Department = require("../models/Department");
const Notification = require("../models/Notification");
const Organization = require("../models/Organization");
const Subscription = require("../models/Subscription");
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = "socialflylive@gmail.com";
const OrganizationInvite = require("../models/OrganizationInvite");
const seedOrganizationDefaults = require("../services/seedOrganizationDefaults");
/* ---------------------------------- UTIL ---------------------------------- */
async function sendBrevoEmail(to, subject, html) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": BREVO_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: { email: SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("❌ Brevo send error:", errorData);
    throw new Error(`Brevo API failed: ${response.status}`);
  }
}

/* ------------------------------- SEND OTP --------------------------------- */
const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    const html = `
      <div style="font-family:sans-serif;padding:10px;">
        <h2>Your OTP Code</h2>
        <p>Use the code below to verify your account:</p>
        <h1 style="letter-spacing:5px;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      </div>
    `;

    await sendBrevoEmail(email, "Your OTP for Signup", html);
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

/* ------------------------- VERIFY OTP AND SIGNUP -------------------------- */
const verifyOtpAndSignup = async (req, res) => {
  const {
    email,
    otp,
    username,
    password,
    organizationName,
    inviteToken,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 🔐 OTP validation
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.otp !== otp) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    let organization;
    let role = "admin";

    // =========================
    // INVITE FLOW
    // =========================
    if (inviteToken) {
      const invite = await OrganizationInvite.findOne({
        inviteToken,
        expiresAt: { $gt: new Date() },
      })
        .populate("organizationId")
        .session(session);

      if (!invite) {
        throw new Error("Invalid or expired invite");
      }

      if (invite.email && invite.email !== email) {
        throw new Error("Invite email mismatch");
      }

      organization = invite.organizationId;
      role = invite.role || "user";

      invite.usedCount += 1;
      await invite.save({ session });
    }

    // =========================
    // OWNER SIGNUP FLOW
    // =========================
    if (!inviteToken) {
      const orgDocs = await Organization.create(
        [
          {
            name:
              organizationName || `${username}'s Organization`,
          },
        ],
        { session }
      );

      organization = orgDocs[0];

      // 🔥 Seed defaults inside transaction
      await seedOrganizationDefaults(organization._id, session);
    }

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userDocs = await User.create(
      [
        {
          username,
          email,
          password: hashedPassword,
          role,
          organizationId: organization._id,
          onboardingCompleted: false,
        },
      ],
      { session }
    );

    const newUser = userDocs[0];

    // Owner-only operations
    if (!inviteToken) {
      organization.createdBy = newUser._id;
      await organization.save({ session });

const now = new Date();
const trialEnd = new Date(
  now.getTime() + 7 * 24 * 60 * 60 * 1000
);

await Subscription.create(
  [
    {
      organizationId: organization._id,
      tier: "trial",
      billingCycle: null,
      status: "trialing",
      currentStart: now,
      currentEnd: trialEnd,
      cancelAtPeriodEnd: false,
    },
  ],
  { session }
);
    }

    await Otp.deleteMany({ email }).session(session);

    await session.commitTransaction();
    session.endSession();

    const token = jwt.sign(
      {
        id: newUser._id,
        role: newUser.role,
        organizationId: organization._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        organizationId: organization._id,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Signup Error:", err);

    return res.status(500).json({
      error: err.message || "Signup failed",
    });
  }
};


/* --------------------------------- LOGIN ---------------------------------- */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found!",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid password!",
      });
    }

    // 🛑 Organization check (except super-admin)
    if (user.role !== "super-admin" && !user.organizationId) {
      return res.status(403).json({
        success: false,
        error: "User is not associated with any organization",
      });
    }

    // ✅ Capture Client IP
    const ip = getClientIp(req);

    // ✅ Get Geo Location from IP
    let locationData = {};

try {
  const geo = await axios.get(`http://ip-api.com/json/${ip}`);

  const lat = Number(geo.data.lat);
  const lon = Number(geo.data.lon);

  locationData = {
    country: geo.data.country,
    region: geo.data.regionName,
    city: geo.data.city,
    isp: geo.data.isp,
  };

  // Only add coordinates if valid
  if (!isNaN(lat) && !isNaN(lon)) {
    locationData.latitude = lat;
    locationData.longitude = lon;
  }

} catch (geoError) {
  console.error("Geo lookup failed:", geoError.message);
}

    // ✅ Save Login Activity
    await LoginActivity.create({
      userId: user._id,
      organizationId: user.organizationId || null,
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
      ...locationData,
    });

    // ✅ Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        organizationId: user.organizationId || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    await User.updateOne(
      { _id: user._id },
      { lastActive: new Date() }
    );

    await Notification.create({
      title: "Login Successful",
      message: "You have successfully logged in.",
      userId: user._id,
    });

    const io = req.app.get("io");
    io.to(user._id.toString()).emit("newNotification", {
      title: "Login Successful",
      message: "You have successfully logged in.",
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        organizationId: user.organizationId || null,
        onboardingCompleted: user.onboardingCompleted,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      error: "Error logging in!",
    });
  }
};


/* ----------------------------- FORGOT PASSWORD ---------------------------- */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetLink = `https://assets.socialflylive.com/user/reset/${token}`;

    const html = `
      <div style="font-family:sans-serif;padding:10px;">
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
      </div>
    `;

    await sendBrevoEmail(email, "Password Reset Request", html);
    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found!" });
    
    const { password, ...userData } = user.toObject();
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user data" });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new passwords are required." });
    }
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    await Notification.create({
      title: "Password Changed",
      message: "Your password has been updated successfully.",
      userId: user._id,
    });
    
    if (req.io) {
      req.io.to(user._id.toString()).emit("notification", {
        title: "Password Changed",
        message: "Your password has been updated successfully."
      });
    }
    
    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ error: "Server error while changing password." });
  }
}
/* ----------------------------- RESET PASSWORD ----------------------------- */
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    await Notification.create({
      title: "Password Changed",
      message: "Your password has been updated successfully.",
      userId: user._id,
    });

    if (req.io) {
      req.io.to(user._id.toString()).emit("notification", {
        title: "Password Changed",
        message: "Your password has been updated successfully.",
      });
    }

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
const completeOnboarding = async (req, res) => {
  try {
    const { userId, profile } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update optional fields only
    Object.assign(user, profile);
    user.onboardingCompleted = true;

    await user.save();

    // 🔑 Auto-login token (ONLY HERE)
    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
        role: user.role,
        username: user.username,
      },
      "jwt_secret",
      { expiresIn: "3h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Complete onboarding error:", error);
    res.status(500).json({ error: "Failed to complete onboarding" });
  }
};

const resetSystemData = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const userId = req.user.id;
      const { password } = req.body;

      if (!password) throw new Error("Password is required");

      const user = await User.findById(userId)
        .select("+password")
        .session(session);

      if (!user) throw new Error("User not found");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid password");

      if (!["owner", "admin", "super-admin"].includes(user.role)) {
        throw new Error("Unauthorized action");
      }

      const organizationId = user.organizationId;
      if (!organizationId) {
        throw new Error("User not associated with organization");
      }

      // 1️⃣ DELETE OPERATIONAL DATA
      await Promise.all([
        Asset.deleteMany({ organizationId }, { session }),
        AssetAssignment.deleteMany({ organizationId }, { session }),
        SupportTicket.deleteMany({ organizationId }, { session }),
        SoftwareAsset.deleteMany({ organizationId }, { session }),
      ]);

      // 2️⃣ DELETE ALL CLASSIFICATIONS
      await Promise.all([
        Category.deleteMany({ organizationId }, { session }),
        Location.deleteMany({ organizationId }, { session }),
        Status.deleteMany({ organizationId }, { session }),
        Unit.deleteMany({ organizationId }, { session }),
        Department.deleteMany({ organizationId }, { session }),
      ]);

      // 3️⃣ RESEED DEFAULTS
      await seedOrganizationDefaults(organizationId, session);

      // 4️⃣ AUDIT LOG
      await ActivityLog.create(
        [
          {
            organizationId,
            userId,
            action: "SYSTEM_RESET",
            description: "Organization factory reset",
            ipAddress: req.ip,
          },
        ],
        { session }
      );
    });

    return res.status(200).json({
      success: true,
      message: "Organization data reset successfully",
    });

  } catch (error) {
    console.error("RESET ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to reset organization data",
    });
  } finally {
    session.endSession();
  }
};

/* ------------------------ RESET PREVIEW (SAFE) --------------------------- */
const resetPreview = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔍 Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🛑 Authorization
    if (!["owner", "admin", "super-admin"].includes(user.role)) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const organizationId = user.organizationId;
    if (!organizationId) {
      return res.status(400).json({
        message: "User is not associated with any organization"
      });
    }

    // 📊 COUNT DATA (NO DELETE)
    const [
      assets,
      assignments,
      tickets,
      softwareAssets,
      categories,
      locations,
      statuses,
      units,
      departments
    ] = await Promise.all([
      Asset.countDocuments({ organizationId }),
      AssetAssignment.countDocuments({ organizationId }),
      SupportTicket.countDocuments({ organizationId }),
      SoftwareAsset.countDocuments({ organizationId }),
      Category.countDocuments({ organizationId }),
      Location.countDocuments({ organizationId }),
      Status.countDocuments({ organizationId }),
      Unit.countDocuments({ organizationId }),
      Department.countDocuments({ organizationId })
    ]);

    return res.status(200).json({
      success: true,
      preview: {
        assets,
        assignments,
        tickets,
        softwareAssets,
        categories,
        locations,
        statuses,
        units,
        departments
      }
    });
  } catch (error) {
    console.error("RESET PREVIEW ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reset preview"
    });
  }
};
module.exports = {
  sendOtp,
  verifyOtpAndSignup,
  login,
  forgotPassword,
  resetPreview,
  resetSystemData,
  resetPassword,
  changePassword,
  getUserData,
  completeOnboarding
};
