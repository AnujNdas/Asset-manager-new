const CoreCompanyLicense = require("../models/CoreCompanyLicense");
const Notification = require("../models/Notification");
const extractTextFromFile = require("../utils/extractTextFromFile");
const parseExtractedText = require("../utils/parseExtractedText");

// --------------------------------------------------------
// 1️⃣ EXTRACT DATA FROM DOCUMENT (OCR)
// --------------------------------------------------------
const extractLicenseData = async (req, res) => {
  try {
    const { licenseType, businessLocation } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // OCR extraction
    const extractedText = await extractTextFromFile(req.file);

    // Parse based on licenseType
    const extractedFields = parseExtractedText(licenseType, extractedText);

    res.status(200).json({
      success: true,
      extractedData: extractedFields,
      rawText: extractedText,
    });
  } catch (err) {
    console.error("OCR Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------------------------------------
// 2️⃣ SAVE FINAL LICENSE AFTER USER EDITS
// --------------------------------------------------------
const saveFinalLicense = async (req, res) => {
  try {
    const userId = req.user?.id;

    const {
      licenseType,
      businessLocation,
      extractedData,
      finalizedData,
      documents,
    } = req.body;

    const newLicense = await CoreCompanyLicense.create({
      licenseType,
      businessLocation,
      extractedData,
      finalizedData,
      documents,
      auditTrail: [
        {
          action: "Created License",
          user: userId,
          timestamp: new Date(),
        },
      ],
    });

    await Notification.create({
      title: "New License Added",
      message: `License created of type ${licenseType}`,
      userId,
    });

    res.status(201).json({ success: true, data: newLicense });
  } catch (err) {
    console.error("Error saving license:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------------------------------------
// 3️⃣ GET ALL LICENSES
// --------------------------------------------------------
const getCompanyLicenses = async (req, res) => {
  try {
    const licenses = await CoreCompanyLicense.find().sort({ createdAt: -1 });
    res.json({ success: true, data: licenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------------------------------------
// 4️⃣ GET A SINGLE LICENSE
// --------------------------------------------------------
const getCompanyLicenseById = async (req, res) => {
  try {
    const license = await CoreCompanyLicense.findById(req.params.id);
    if (!license) {
      return res
        .status(404)
        .json({ success: false, message: "License not found" });
    }
    res.json({ success: true, data: license });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------------------------------------
// 5️⃣ UPDATE LICENSE
// --------------------------------------------------------
const updateLicense = async (req, res) => {
  try {
    const userId = req.user?.id;

    const updated = await CoreCompanyLicense.findByIdAndUpdate(
      req.params.id,
      {
        $set: { finalizedData: req.body.finalizedData },
        $push: {
          auditTrail: {
            action: "Updated License",
            user: userId,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "License not found" });
    }

    await Notification.create({
      title: "License Updated",
      message: `License updated: ${updated.licenseType}`,
      userId,
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------------------------------------
// 6️⃣ DELETE LICENSE
// --------------------------------------------------------
const deleteCompanyLicense = async (req, res) => {
  try {
    const userId = req.user?.id;

    const deleted = await CoreCompanyLicense.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "License not found" });
    }

    await Notification.create({
      title: "License Removed",
      message: `License removed: ${deleted.licenseType}`,
      userId,
    });

    res.json({ success: true, message: "License deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------------------------------------

module.exports = {
  extractLicenseData,
  saveFinalLicense,
  updateLicense,
  getCompanyLicenses,
  getCompanyLicenseById,
  deleteCompanyLicense,
};
