const CoreCompanyLicense = require("../models/CoreCompanyLicense");
const Notification = require("../models/Notification");

// Create a new company license
const createCompanyLicense = async (req, res) => {
  try {
    const userId = req.user?.id;

    const newLicense = new CoreCompanyLicense({
      ...req.body,
      auditTrail: [
        {
          action: "Created",
          user: userId,
          timestamp: new Date(),
        },
      ],
    });

    await newLicense.save();

    // ✅ Create real-time notification
    const newNotification = await Notification.create({
      title: "New License Added",
      message: `License "${newLicense.licenseName}" was created for ${newLicense.businessDetails?.legalName || "a company"}.`,
      userId,
    });

    // ✅ Emit notification using Socket.IO
    const io = req.app.get("io");
    if (io && userId) io.to(userId.toString()).emit("newNotification", newNotification);

    res.status(201).json({ success: true, data: newLicense });
  } catch (err) {
    console.error("❌ Error creating license:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all licenses
const getCompanyLicenses = async (req, res) => {
  try {
    const licenses = await CoreCompanyLicense.find().sort({ createdAt: -1 });
    res.json({ success: true, data: licenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single license by ID
const getCompanyLicenseById = async (req, res) => {
  try {
    const license = await CoreCompanyLicense.findById(req.params.id);
    if (!license) {
      return res.status(404).json({ success: false, message: "License not found" });
    }
    res.json({ success: true, data: license });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update license
const updateCompanyLicense = async (req, res) => {
  try {
    const userId = req.user?.id;

    const updatedLicense = await CoreCompanyLicense.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        $push: {
          auditTrail: {
            action: "Updated",
            user: userId,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedLicense) {
      return res.status(404).json({ success: false, message: "License not found" });
    }

    // ✅ Send notification
    const newNotification = await Notification.create({
      title: "License Updated",
      message: `License "${updatedLicense.licenseName}" has been updated.`,
      userId,
    });

    const io = req.app.get("io");
    if (io) io.to(userId.toString()).emit("newNotification", newNotification);

    res.json({ success: true, data: updatedLicense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete license
const deleteCompanyLicense = async (req, res) => {
  try {
    const userId = req.user?.id;

    const deletedLicense = await CoreCompanyLicense.findByIdAndDelete(req.params.id);
    if (!deletedLicense) {
      return res.status(404).json({ success: false, message: "License not found" });
    }

    // ✅ Notification after deletion
    const newNotification = await Notification.create({
      title: "License Removed",
      message: `License "${deletedLicense.licenseName}" has been deleted.`,
      userId,
    });

    const io = req.app.get("io");
    if (io) io.to(userId.toString()).emit("newNotification", newNotification);

    res.json({ success: true, message: "License deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createCompanyLicense,
  getCompanyLicenses,
  getCompanyLicenseById,
  updateCompanyLicense,
  deleteCompanyLicense,
};
