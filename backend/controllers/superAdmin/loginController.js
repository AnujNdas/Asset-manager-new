const User = require("../models/User"); // Adjust path to your User model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { getClientIp } = require("../utils/ipUtils"); // Adjust path to your IP utility
const LoginActivity = require("../models/LoginActivity"); // Adjust path
const sendNotification = require("../utils/notificationUtils"); // Adjust path

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Super Admin account not found!",
      });
    }

    // 🛑 STRICT SECURITY CHECK: Enforce Super Admin role only
    if (user.role !== "super-admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Unauthorized role.",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid password!",
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

      if (!isNaN(lat) && !isNaN(lon)) {
        locationData.latitude = lat;
        locationData.longitude = lon;
      }
    } catch (geoError) {
      console.error("Geo lookup failed:", geoError.message);
    }

    // ✅ Save Login Activity for Audit Trail
    await LoginActivity.create({
      userId: user._id,
      organizationId: null, // Super admins don't belong to tenants
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
      ...locationData,
    });

    // ✅ Generate Secure JWT Token for Super Admin
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" } // Slightly tighter session expiry for security
    );

    await User.updateOne(
      { _id: user._id },
      { lastActive: new Date() }
    );

    await sendNotification({
      req,
      userId: user._id,
      title: "Super Admin Login",
      message: "Successful login to the private super-admin portal.",
      type: "success",
    });

    return res.status(200).json({
      success: true,
      token,
      username: user.username,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Super Admin Login Error:", error);
    return res.status(500).json({
      success: false,
      error: "Error processing super admin authentication!",
    });
  }
};

module.exports = { adminLogin };