const SoftwareAsset = require("../models/SoftwareAsset");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// Helper to update compliance based on license usage & expiry
const checkCompliance = (asset) => {
  if (asset.licenseExpiry && new Date(asset.licenseExpiry) < new Date()) {
    return "Expired";
  }
  if (asset.licensesAssigned > asset.totalLicenses) {
    return "Non-Compliant";
  }
  return "Compliant";
};

// Create a new software asset
const createSoftwareAsset = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Missing userId" });
    }

    // Auto calculations
    if (req.body.totalLicenses && req.body.licensesAssigned) {
      req.body.licensesAvailable = req.body.totalLicenses - req.body.licensesAssigned;
    }
    if (req.body.totalLicenses && req.body.costPerUnit) {
      req.body.totalCost = req.body.totalLicenses * req.body.costPerUnit;
    }

    // Compliance
    req.body.complianceStatus = checkCompliance(req.body);

    // Add audit log
    req.body.auditHistory = [
      ...(req.body.auditHistory || []),
      { date: new Date(), notes: `Created by user ${userId}` },
    ];

    const asset = await SoftwareAsset.create(req.body);

    // Expiry reminder (30 days before)
    if (
      asset.licenseExpiry &&
      new Date(asset.licenseExpiry) - new Date() < 30 * 24 * 60 * 60 * 1000
    ) {
      await Notification.create({
        title: "License Expiry Soon",
        message: `License for '${asset.name}' will expire soon.`,
        userId,
      });
    }

    // Notification - Asset added
    const newNotification = await Notification.create({
      title: "Software Asset Added",
      message: `Software '${asset.name}' has been added.`,
      userId,
    });

    const io = req.app.get("io");
    io.to(userId.toString()).emit("newNotification", newNotification);

    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    console.error("Error in createSoftwareAsset:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all software assets
const getSoftwareAssets = async (req, res) => {
  try {
    const assets = await SoftwareAsset.find().sort({ createdAt: -1 });
    res.json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single software asset
const getSoftwareAssetById = async (req, res) => {
  try {
    const asset = await SoftwareAsset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update software asset
const updateSoftwareAsset = async (req, res) => {
  try {
    const userId = req.user.id;

    // Auto calculations
    if (req.body.totalLicenses && req.body.licensesAssigned) {
      req.body.licensesAvailable = req.body.totalLicenses - req.body.licensesAssigned;
    }
    if (req.body.totalLicenses && req.body.costPerUnit) {
      req.body.totalCost = req.body.totalLicenses * req.body.costPerUnit;
    }

    req.body.complianceStatus = checkCompliance(req.body);

    // Add audit log
    req.body.$push = {
      auditHistory: { date: new Date(), notes: `Updated by user ${userId}` },
    };

    const asset = await SoftwareAsset.findByIdAndUpdate(req.params.id, req.body, { new: true });

    const newNotification = await Notification.create({
      title: "Software Asset Updated",
      message: `Software '${asset?.name || ""}' has been updated.`,
      userId,
    });

    const io = req.app.get("io");
    io.to(userId.toString()).emit("newNotification", newNotification);

    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete software asset
const deleteSoftwareAsset = async (req, res) => {
  try {
    const userId = req.user.id;
    const asset = await SoftwareAsset.findByIdAndDelete(req.params.id);

    if (!asset) return res.status(404).json({ success: false, message: "Not found" });

    const newNotification = await Notification.create({
      title: "Software Asset Deleted",
      message: `Software '${asset.name}' has been deleted.`,
      userId,
    });

    const io = req.app.get("io");
    io.to(userId.toString()).emit("newNotification", newNotification);

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSoftwareAsset,
  getSoftwareAssets,
  getSoftwareAssetById,
  updateSoftwareAsset,
  deleteSoftwareAsset,
};
