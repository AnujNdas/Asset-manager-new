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
const AssetInstance = require("../models/AssetInstance");
const Employee = require("../models/Employee");
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
const AffiliateProfile = require("../models/AffiliateProfile");
const AffiliateReferral = require("../models/AffiliateReferral");
const OrganizationInvite = require("../models/OrganizationInvite");
const seedOrganizationDefaults = require("../services/seedOrganizationDefaults");
const sendNotification = require("../utils/notify");
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
const generateOrgCode = (name) => {
  if (!name || typeof name !== "string") {
    return `ORG-${Date.now()}`;
  }

  return name
    .trim()
    .split(" ")
    .map(word => word[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 5) + "-" + Math.floor(Math.random() * 1000);
};
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
<div style="font-family:Arial,sans-serif;background:#f4f4f4;padding:30px;">
  <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;padding:40px;text-align:center;">

    <img
      src="https://assetpegasus.com/images/logo2.png"
      alt="Asset Pegasus"
      style="width:180px;margin-bottom:20px;"
    />

    <h2 style="color:#333;margin-bottom:10px;">
      Verify Your Email
    </h2>

    <p style="color:#666;font-size:15px;">
      We received your request for a verification code.
    </p>

    <div style="
      display:inline-block;
      margin:25px 0;
      padding:15px 30px;
      background:#6C63FF;
      color:#fff;
      font-size:32px;
      font-weight:bold;
      letter-spacing:8px;
      border-radius:8px;
    ">
      ${otp}
    </div>

    <p style="color:#555;">
      This code will expire in <strong>5 minutes</strong>.
    </p>

    <p style="font-size:13px;color:#999;margin-top:30px;">
      Never share this code with anyone. Asset Pegasus will never ask for your OTP.
    </p>

    <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />

    <p style="font-size:12px;color:#999;">
      © ${new Date().getFullYear()} Asset Pegasus. All rights reserved.
    </p>

  </div>
</div>
`;

    await sendBrevoEmail(email, "Your OTP for Signup", html);
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};
const isStrongPassword = (password) => {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{8,}$/;

  return strongPasswordRegex.test(password);
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

    /* ======================================
       🔹 OTP VALIDATION
    ====================================== */

    const otpRecord = await Otp.findOne({ email })
      .sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.otp !== otp) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        error: "Invalid or expired OTP",
      });
    }

    let organization;
    let role = "admin";

    /* ======================================
       🔹 INVITE FLOW
    ====================================== */

    if (inviteToken) {

      const invite =
        await OrganizationInvite.findOne({
          inviteToken,
          expiresAt: { $gt: new Date() },
        })
          .populate("organizationId")
          .session(session);

      if (!invite) {
        throw new Error(
          "Invalid or expired invite"
        );
      }

      if (
        invite.email &&
        invite.email !== email
      ) {
        throw new Error(
          "Invite email mismatch"
        );
      }

      organization =
        invite.organizationId;

      role =
        invite.role || "user";

      invite.usedCount += 1;

      await invite.save({ session });
    }

    /* ======================================
       🔹 OWNER SIGNUP FLOW
    ====================================== */

    if (!inviteToken) {

      const orgCode = generateOrgCode(
        organizationName ||
        `${username}'s Organization`
      );

      const orgDocs =
        await Organization.create(
          [
            {
   name:
     organizationName ||
     `${username}'s Organization`,

   orgCode,

   onboardingCompleted: false
}
          ],
          { session }
        );

      organization = orgDocs[0];

      // 🔥 Seed defaults
      await seedOrganizationDefaults(
        organization._id,
        session
      );
    }

    /* ======================================
       🔒 PASSWORD VALIDATION
    ====================================== */

    if (!isStrongPassword(password)) {

      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    /* ======================================
       🔒 HASH PASSWORD
    ====================================== */

    const hashedPassword =
      await bcrypt.hash(password, 10);

    /* ======================================
       🔹 CREATE USER
    ====================================== */

    const userDocs = await User.create(
      [
        {
          username,
          email,
          password: hashedPassword,

          role,

          organizationId:
            organization._id,
        },
      ],
      { session }
    );

    const newUser = userDocs[0];

    /* ======================================
       🔹 AFFILIATE TRACKING
    ====================================== */

    const referralToken =
      req.signedCookies?.affiliate_ref;

    if (referralToken) {

      const referral =
        await AffiliateReferral.findOne({
          referralToken,
          status: "clicked",
        }).session(session);

      if (referral) {

        // 🔥 Prevent self-referral fraud
if (
  referral.referredUserId &&
  referral.referredUserId.toString() ===
  newUser._id.toString()
) {

  referral.isFraud = true;

  referral.fraudReason =
    "Self referral";

  await referral.save({ session });

} else {

          referral.referredUserId =
            newUser._id;

          referral.organizationId =
            organization._id;

          referral.status =
            "signed_up";

          referral.signupAt =
            new Date();

          await referral.save({
            session,
          });

          // 🔥 increment affiliate stats
          await AffiliateProfile.updateOne(
            {
              _id:
                referral.affiliateId,
            },
            {
              $inc: {
                totalReferrals: 1,
              },
            },
            { session }
          );
        }
      }
    }

    /* ======================================
       🔹 OWNER-ONLY OPERATIONS
    ====================================== */

    if (!inviteToken) {

      organization.createdBy =
        newUser._id;

      await organization.save({
        session,
      });

      const now = new Date();

      const trialEnd = new Date(
        now.getTime() +
        7 * 24 * 60 * 60 * 1000
      );

      await Subscription.create(
        [
          {
            organizationId:
              organization._id,

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

    /* ======================================
       🔹 CLEANUP OTP
    ====================================== */

    await Otp.deleteMany({
      email,
    }).session(session);

    /* ======================================
       🔹 COMMIT TRANSACTION
    ====================================== */

    await session.commitTransaction();
    session.endSession();
    const organizationResponse = await Organization.findById(
  organization._id
).select(
  "name orgCode organizationType country city officeLocation currency onboardingCompleted status"
);
    /* ======================================
       🔹 JWT
    ====================================== */

    const token = jwt.sign(
      {
        id: newUser._id,

        role: newUser.role,

        organizationId:
          organization._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "3h",
      }
    );

return res.status(201).json({
  success: true,

  token,

  user: {
    id: newUser._id,
    email: newUser.email,
    role: newUser.role,

    organizationId: organization._id,

    organizationOnboarded:
      organizationResponse.onboardingCompleted,
  },

  organization: organizationResponse,
});

  } catch (err) {

    await session.abortTransaction();
    session.endSession();

    console.error(
      "Signup Error:",
      err
    );

    return res.status(500).json({
      error:
        err.message ||
        "Signup failed",
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
// 🛑 Organization check
// Affiliates and super-admins do not require organization
let organization = null;

if (user.organizationId) {

organization = await Organization.findById(
  user.organizationId
).select(
  "name orgCode organizationType country city officeLocation currency onboardingCompleted status"
);
}
const rolesWithoutOrg = [
  "super-admin",
  "affiliate",
];

if (
  !rolesWithoutOrg.includes(user.role) &&
  !user.organizationId
) {
  return res.status(403).json({
    success: false,
    error:
      "User is not associated with any organization",
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

await sendNotification({
  req,
  userId: user._id,
  title: "Login Successful",
  message: "You have successfully logged in.",
  type: "success"
});
    return res.status(200).json({
      success: true,
      token,
      user: {
  _id: user._id,

  email: user.email,

  username: user.username,

  role: user.role,

  organizationId:
    user.organizationId || null,

  onboardingCompleted:
    user.onboardingCompleted,

  organizationOnboardingCompleted:
    organization?.onboardingCompleted || false,
},
organization,
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
    
await sendNotification({
  req,
  userId: user._id,
  title: "Password changed successfully",
  message: "Your Password has changed successfully ",
  type: "success"
});
    
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

await sendNotification({
  req,
  userId: user._id,
  title: "Password reset Successfully",
  message: "You have successfully Reset your Password.",
  type: "success"
});

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
      return res.status(404).json({
        error: "User not found"
      });
    }

    /* =========================
       UPDATE USER PROFILE
    ========================= */

    Object.assign(user, profile);

    user.onboardingCompleted = true;

    await user.save();

    /* =========================
       COMPLETE ORG ONBOARDING
    ========================= */

    if (user.organizationId) {

      await Organization.findByIdAndUpdate(
        user.organizationId,
        {
          onboardingCompleted: true,
        }
      );
    }

    /* =========================
       JWT
    ========================= */

    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
        role: user.role,
        username: user.username,
        organizationId:
          user.organizationId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "3h",
      }
    );

    /* =========================
       RESPONSE
    ========================= */

    res.json({
      success: true,

      token,

      user: {
        id: user._id,

        email: user.email,

        username: user.username,

        role: user.role,

        organizationId:
          user.organizationId,

        onboardingCompleted: true,

        organizationOnboardingCompleted: true,
      },
    });

  } catch (error) {

    console.error(
      "Complete onboarding error:",
      error
    );

    res.status(500).json({
      error:
        "Failed to complete onboarding",
    });
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
        AssetInstance.deleteMany({ organizationId }, { session }), // 🔥 first
        AssetAssignment.deleteMany({ organizationId }, { session }),
        Asset.deleteMany({ organizationId }, { session }),
        SoftwareAsset.deleteMany({ organizationId }, { session }),
        SupportTicket.deleteMany({ organizationId }, { session }),
        Employee.deleteMany({ organizationId }, { session }),
      ]);

      // 2️⃣ DELETE ALL CLASSIFICATIONS
await Promise.all([
  Category.deleteMany({ organizationId, isSystem: false }, { session }),
  Location.deleteMany({ organizationId, isSystem: false }, { session }),
  Status.deleteMany({ organizationId, isSystem: false }, { session }),
  Unit.deleteMany({ organizationId, isSystem: false }, { session }),
  Department.deleteMany({ organizationId, isSystem: false }, { session }),
]);

      // 3️⃣ RESEED DEFAULTS
const hasSystemCategories = await Category.exists({
  organizationId,
  isSystem: true,
}).session(session);

if (!hasSystemCategories) {
  await seedOrganizationDefaults(organizationId, session);
}

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
      departments,
      employees
    ] = await Promise.all([
      Asset.countDocuments({ organizationId }),
      AssetAssignment.countDocuments({ organizationId }),
      SupportTicket.countDocuments({ organizationId }),
      SoftwareAsset.countDocuments({ organizationId }),
      Category.countDocuments({ organizationId }),
      Location.countDocuments({ organizationId }),
      Status.countDocuments({ organizationId }),
      Unit.countDocuments({ organizationId }),
      Department.countDocuments({ organizationId }),
      Employee.countDocuments({ organizationId })
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
        departments,
        employees
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
