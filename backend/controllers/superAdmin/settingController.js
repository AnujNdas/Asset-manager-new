const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");
const AffiliateProfile = require("../../models/AffiliateProfile");
const AffiliateTicket = require("../../models/AffiliateTicket");
const AffiliateProfile = require("../models/AffiliateProfile");

/**
 * @desc    Super Admin: Approve or Reject an Affiliate Profile
 * @route   PATCH /api/admin/affiliates/:id/status
 * @access  Private (Super Admin)
 */
const updateAffiliateStatus = async (req, res) => {
  try {
    const { id } = req.params; // AffiliateProfile ID (or userId, see note below)
    const { status, rejectionReason } = req.body;

    // 1. Validate status input
    const validStatuses = ["approved", "rejected", "suspended"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Choose from: ${validStatuses.join(", ")}`,
      });
    }

    // 2. If rejected, ensure a reason is provided
    if (status === "rejected" && (!rejectionReason || !rejectionReason.trim())) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required when rejecting an affiliate.",
      });
    }

    // 3. Find the affiliate profile
    // Note: If req.params.id is the User's ID instead of the AffiliateProfile ID, 
    // change this to: { userId: id }
    const affiliate = await AffiliateProfile.findById(id);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate profile not found.",
      });
    }

    // 4. Prepare update payload based on the new status
    const updateData = { status };
    const adminId = req.user._id; // Assumes auth middleware attaches logged-in super admin to req.user

    if (status === "approved") {
      updateData.approvedAt = new Date();
      updateData.approvedBy = adminId;
      // Clear out previous rejection fields if re-approving
      updateData.rejectedAt = null;
      updateData.rejectedBy = null;
      updateData.rejectionReason = "";
    } else if (status === "rejected") {
      updateData.rejectedAt = new Date();
      updateData.rejectedBy = adminId;
      updateData.rejectionReason = rejectionReason.trim();
    }

    // 5. Update the profile
    const updatedAffiliate = await AffiliateProfile.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("userId", "username email role");

    // 6. Optional: Send email notification to affiliate here about approval/rejection

    return res.status(200).json({
      success: true,
      message: `Affiliate has been successfully ${status}.`,
      data: updatedAffiliate,
    });

  } catch (error) {
    console.error("Error updating affiliate status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating affiliate status.",
      error: error.message,
    });
  }
};

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
  updateAffiliateStatus
};