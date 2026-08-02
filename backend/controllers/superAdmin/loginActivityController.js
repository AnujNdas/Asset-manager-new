const LoginActivity = require("../../models/LoginActivity");

const getLoginActivity = async (req, res) => {
  try {
    const logs = await LoginActivity.find()
      .populate("userId", "username email role")
      .populate("organizationId", "name")
      .sort({ createdAt: -1 });

    const users = {};

    logs.forEach((log) => {
      if (!log.userId) return;

      const id = log.userId._id.toString();

      if (!users[id]) {
        users[id] = {
          userId: id,
          username: log.userId.username,
          email: log.userId.email,
          role: log.userId.role,
          organization:
            log.organizationId?.name || null,

          lastLogin: log.createdAt,

          latestIP: log.ip,
          latestCity: log.city,
          latestISP: log.isp,
          latestBrowser: log.browser,

          history: [],
        };
      }

      users[id].history.push({
        id: log._id,

        loginAt: log.createdAt,

        ip: log.ip,

        city: log.city,

        isp: log.isp,

        organization:
          log.organizationId?.name || null,

        browser: log.browser,

        os: log.os,

        device: log.device,

        userAgent: log.userAgent,
      });
    });

    return res.json({
      success: true,
      data: Object.values(users),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  getLoginActivity,
};