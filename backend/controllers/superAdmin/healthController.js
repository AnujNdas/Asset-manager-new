const mongoose = require("mongoose");

const healthCheck = async (req, res) => {
  const started = Date.now();

  const checks = [];

  // Database
  try {
    await mongoose.connection.db.admin().ping();

    checks.push({
      name: "MongoDB",
      status: "UP",
      responseTime: Date.now() - started,
      message: "Connected",
    });
  } catch (err) {
    checks.push({
      name: "MongoDB",
      status: "DOWN",
      responseTime: null,
      message: err.message,
    });
  }

  res.status(200).json({
    success: true,
    serverTime: new Date(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    checks,
  });
};

module.exports = {
  healthCheck,
};