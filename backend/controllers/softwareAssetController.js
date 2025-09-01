const SoftwareAsset = require("../models/SoftwareAsset");

// Create a new software asset
const createSoftwareAsset = async (req, res) => {
  try {
    const asset = new SoftwareAsset(req.body);
    await asset.save();
    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all software assets
const getSoftwareAssets = async (req, res) => {
  try {
    const assets = await SoftwareAsset.find();
    res.json({ success: true, data: assets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single software asset
const getSoftwareAssetById = async (req, res) => {
  try {
    const asset = await SoftwareAsset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: "Software asset not found" });
    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update software asset
const updateSoftwareAsset = async (req, res) => {
  try {
    const asset = await SoftwareAsset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete software asset
const deleteSoftwareAsset = async (req, res) => {
  try {
    await SoftwareAsset.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Software asset deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createSoftwareAsset,
  getSoftwareAssets,
  getSoftwareAssetById,
  updateSoftwareAsset,
  deleteSoftwareAsset
};
