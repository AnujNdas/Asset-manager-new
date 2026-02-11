const LoginActivity = require("../../models/LoginActivity");
const getLoginActivity = async (req, res) => {
  try {
    const logs = await LoginActivity.find()
      .populate("userId", "username email role")
      .populate("organizationId", "name")
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Login Activity Fetch Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch login activity",
    });
  }
};
module.exports = {
  getLoginActivity,
};  