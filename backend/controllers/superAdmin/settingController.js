const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");
const AffiliateProfile = require("../../models/AffiliateProfile");
const AffiliateTicket = require("../../models/AffiliateTicket");
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
const resolveAffiliateTicket =
  asyncHandler(async (req, res) => {

    const { resolution } = req.body;

    const ticket =
      await AffiliateTicket.findById(
        req.params.id
      );

    if (!ticket) {
      throw new AppError(
        "Ticket not found",
        404
      );
    }

    ticket.status = "resolved";

    ticket.resolution =
      resolution || "";

    ticket.resolvedAt =
      new Date();

    ticket.resolvedBy =
      req.user.id;

    await ticket.save();

    res.json({
      success: true,
      message:
        "Ticket resolved successfully",
    });
  });
module.exports = {
  getSettings,
  updateSettings,
  resolveAffiliateTicket,
};