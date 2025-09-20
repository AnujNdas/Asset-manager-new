const CoreCompanyLicense = require("../models/CoreCompanyLicense");
const Notification = require("../models/Notification");

// Create a new company license
const createCompanyLicense = async (req, res) => {
  try {
    const userId = req.user.id;

    const license = new CoreCompanyLicense(req.body);
    await license.save();

    // Create notification
    const newNotification = await Notification.create({
      title: "License Added",
      message: `Company license for "${license.licenseHolder}" created successfully.`,
      userId,
    });

    // Emit notification to user's room
    const io = req.app.get("io");
    io.to(userId.toString()).emit("newNotification", newNotification);

    res.status(201).json({ success: true, data: license });
  } catch (err) {
    console.error("❌ Error creating license:", err); // log full error
    res.status(500).json({ success: false, message: err.message, error: err });
  }
};

// Get all licenses
const getCompanyLicenses = async (req, res) => {
  try {
    const licenses = await CoreCompanyLicense.find();
    res.json({ success: true, data: licenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single license
const getCompanyLicenseById = async (req, res) => {
  try {
    const license = await CoreCompanyLicense.findById(req.params.id);
    if (!license)
      return res.status(404).json({ success: false, message: "License not found" });

    res.json({ success: true, data: license });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update license
const updateCompanyLicense = async (req, res) => {
  try {
    const userId = req.user.id;

    const license = await CoreCompanyLicense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!license) {
      return res.status(404).json({ success: false, message: "License not found" });
    }

    // Create notification
    const newNotification = await Notification.create({
      title: "License Updated",
      message: `Company license "${license.name}" updated successfully.`,
      userId,
    });

    // Emit notification
    const io = req.app.get("io");
    io.to(userId.toString()).emit("newNotification", newNotification);

    res.json({ success: true, data: license });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete license
const deleteCompanyLicense = async (req, res) => {
  try {
    const userId = req.user.id;

    const license = await CoreCompanyLicense.findByIdAndDelete(req.params.id);

    if (!license) {
      return res.status(404).json({ success: false, message: "License not found" });
    }

    // Create notification
    const newNotification = await Notification.create({
      title: "License Deleted",
      message: `Company license "${license.name}" deleted successfully.`,
      userId,
    });

    // Emit notification
    const io = req.app.get("io");
    io.to(userId.toString()).emit("newNotification", newNotification);

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
