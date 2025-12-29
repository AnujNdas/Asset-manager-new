const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const Otp = require("../models/Otp");
const crypto = require("crypto");
const User = require("../models/User");
const Notification = require("../models/Notification");

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = "vaultifly@gmail.com";

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
  const { email, otp, username, password } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord) return res.status(400).json({ error: "OTP expired or not found" });
    if (otpRecord.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role: "user" });
    await newUser.save();

    await Notification.create({
      title: "Welcome!",
      message: `Account created successfully.`,
      userId: newUser._id
    });

    const io = req.app.get("io");
    io.to(newUser._id.toString()).emit("newNotification", {
      title: "Welcome!",
      message: "Account created successfully."
    });

    await Otp.deleteMany({ email });

    res.status(201).json({
      message: "User created successfully!",
      user: { username: newUser.username, email: newUser.email }
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

/* --------------------------------- LOGIN ---------------------------------- */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found!" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid Password!" });

    // 🔥 UPDATE lastActive timestamp
    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role, username: user.username },
      "jwt_secret",
      { expiresIn: "3h" }
    );

    // Notification
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

    res.json({
      message: "Logged in!",
      token,
      role: user.role,
      userId: user._id,
      username: user.username,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging in!" });
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

    const resetLink = `https://asset-manager-new-production.up.railway.app/user/reset/${token}`;

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

module.exports = {
  sendOtp,
  verifyOtpAndSignup,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getUserData
};
