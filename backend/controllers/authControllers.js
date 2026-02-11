const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const axios = require("axios");
const LoginActivity = require("../models/LoginActivity");
const { getClientIp } = require("../utils/ipUtils");

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
const SENDER_EMAIL = "vaultifly@gmail.com";
const OrganizationInvite = require("../models/OrganizationInvite");
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
  console.log("Signup payload:", req.body);

  try {
    // 🔐 OTP verification
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord || otpRecord.otp !== otp) {
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
      }).populate("organizationId");

      if (!invite) {
        return res.status(400).json({ error: "Invalid or expired invite" });
      }

      // Optional but recommended
      if (invite.email && invite.email !== email) {
        return res
          .status(400)
          .json({ error: "Invite email mismatch" });
      }

      organization = invite.organizationId;
      role = invite.role || "user";

      // Multi-use support
      invite.usedCount += 1;
      await invite.save();
    }

    // =========================
    // OWNER SIGNUP FLOW
    // =========================
    if (!inviteToken) {
      organization = await Organization.create({
        name: organizationName || `${username}'s Organization`,
      });
    }

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 👤 Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      organizationId: organization._id,
      onboardingCompleted: false,
    });

    // Link org creator ONLY for owner signup
    if (!inviteToken) {
      organization.createdBy = newUser._id;
      await organization.save();

      // Trial subscription only once per org
      await Subscription.create({
        organizationId: organization._id,
        plan: "trial",
        status: "trialing",
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });
    }

    await Otp.deleteMany({ email });

    // 🎟 JWT
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
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Signup failed" });
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
      locationData = {
        country: geo.data.country,
        region: geo.data.regionName,
        city: geo.data.city,
        lat: geo.data.lat,
        lon: geo.data.lon,
        isp: geo.data.isp,
      };
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
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (!["owner", "admin", "super-admin"].includes(user.role)) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const organizationId = user.organizationId;
    if (!organizationId) {
      return res.status(400).json({
        message: "User is not associated with any organization"
      });
    }

    await Promise.all([
      Asset.deleteMany({ organizationId }),
      AssetAssignment.deleteMany({ organizationId }),
      SupportTicket.deleteMany({ organizationId }),
      SoftwareAsset.deleteMany({ organizationId }),
      Category.deleteMany({ organizationId }),
      Location.deleteMany({ organizationId }),
      Status.deleteMany({ organizationId }),
      Unit.deleteMany({ organizationId }),
      Department.deleteMany({ organizationId }),
    ]);

    // 📝 AUDIT LOG
    await ActivityLog.create({
      organizationId,
      userId,
      action: "SYSTEM_RESET",
      description: "Organization data reset",
      ipAddress: req.ip
    });

    // 🔔 NOTIFICATION
    const notification = await Notification.create({
      title: "Organization Data Reset",
      message:
        "All operational data for your organization has been reset successfully.",
      userId,
      organizationId,
      type: "security"
    });

    // ⚡ REAL-TIME EMIT
    const io = req.app.get("io");
    if (io) {
      io.to(userId.toString()).emit("newNotification", {
        title: notification.title,
        message: notification.message,
        type: "security"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organization data reset successfully"
    });
  } catch (error) {
    console.error("RESET ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset organization data"
    });
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
