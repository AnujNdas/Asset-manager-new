let systemSettings = {
  allowRegistrations: true,
  maintenanceMode: false,
};

const getSettings = async (req, res) => {
  res.status(200).json({
    success: true,
    data: systemSettings,
  });
};

const updateSettings = async (req, res) => {
  try {
    systemSettings = {
      ...systemSettings,
      ...req.body,
    };

    res.status(200).json({
      success: true,
      data: systemSettings,
    });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
};
module.exports = {
  getSettings,
  updateSettings,
};