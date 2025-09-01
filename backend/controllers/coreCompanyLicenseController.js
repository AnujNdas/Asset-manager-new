const CoreCompanyLicense = require("../models/CoreCompanyLicense");

// Create a new company license
const createCompanyLicense = async (req, res) => {
  try {
    const license = new CoreCompanyLicense(req.body);
    await license.save();
    res.status(201).json({ success: true, data: license });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    if (!license) return res.status(404).json({ success: false, message: "License not found" });
    res.json({ success: true, data: license });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update license
const updateCompanyLicense = async (req, res) => {
  try {
    const license = await CoreCompanyLicense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: license });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete license
const deleteCompanyLicense = async (req, res) => {
  try {
    await CoreCompanyLicense.findByIdAndDelete(req.params.id);
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
  deleteCompanyLicense
};
