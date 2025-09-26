const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Otp = require("../models/Otp");
const crypto = require("crypto");
const User = require("../models/User");
const Notification = require("../models/Notification");

// In-memory OTP store (better: Redis or DB)
const otpStore = {};
console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass:", process.env.EMAIL_PASS ? "Loaded" : "Missing");

// Email transporter (Use your Gmail or SMTP service)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

// Send OTP API
const sendOtp = async (req, res) => {
  const { email } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered!" });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Delete old OTP for this email (optional)
    await Otp.deleteMany({ email });
    
    // Save new OTP in DB
    await Otp.create({ email, otp });
    
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Signup",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`
    });
    
    return res.status(200).json({success : true ,  message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};

const verifyOtpAndSignup = async (req, res) => {
  const { email, otp, username, password } = req.body;
  
  try {
    // Check if OTP exists
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(400).json({ error: "OTP expired or not found" });
    }
    
    // Validate OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role : "user"
    });
    await newUser.save();
    
    // Create notification
    await Notification.create({
      title: "Welcome!",
      message: `Account created successfully.`,
      userId: newUser._id
    });
    
    // Emit via socket if needed
const io = req.app.get("io");
io.to(newUser._id.toString()).emit("newNotification", {
  title: "Welcome!",
  message: "Account created successfully."
});

    // Delete OTP after successful signup
    await Otp.deleteMany({ email });

    return res.status(201).json({
      message: "User created successfully!",
      user: {
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
};


// ✅ Login controller (keep same as before)
const login = async (req, res) => {
  const { email, password } = req.body;
  try { 
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found!" });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: "Invalid Password!" });
    
    const token = jwt.sign({ email: user.email, id: user._id , role : user.role , username : user.username }, "jwt_secret", {
      expiresIn: "3h",
    });
    
    await Notification.create({ 
      title: "Login Successful",
      message: "You have successfully logged in.",
      userId: user._id,
    });
    
   const io = req.app.get("io");
io.to(user._id.toString()).emit("newNotification", {
  title: "Login Successful",
  message: "You have successfully logged in."
});

    
    res.json({ message: "Logged in!", token  , role : user.role , userId : user._id , username : user.username});
  } catch (error) {
    res.status(500).json({ error: "Error logging in!" });
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
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // valid 1 hour
    await user.save();

    const resetLink = `http://localhost:3000/user/reset/${token}`;

    // Transporter (use your SMTP or Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Asset Manager" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};


const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // valid token
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save(); 
       // 🔔 Save notification in DB
    await Notification.create({
      title: "Password Changed",
      message: "Your password has been updated successfully.",
      userId: user._id,
    });

    // 🔔 Emit real-time notification
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

module.exports = { sendOtp, verifyOtpAndSignup, login, getUserData, changePassword , forgotPassword , resetPassword};
