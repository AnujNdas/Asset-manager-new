const CoreCompanyLicense = require("../models/CoreCompanyLicense");
const Notification = require("../models/Notification");
const extractTextFromFile = require("../utils/extractTextFromFile");
const parseExtractedText = require("../utils/parseExtractedText");

// ================================================
// 1️⃣ OCR EXTRACT
// ================================================
const extractLicenseData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const extractedText = await extractTextFromFile(req.file);
    const parsedFields = parseExtractedText(req.body.licenseType, extractedText);

    res.status(200).json({
      success: true,
      extractedData: parsedFields,
      rawText: extractedText,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "OCR failed",
    });
  }
};

// ================================================
// 2️⃣ SAVE FINAL LICENSE (with extractedData)
// ================================================
const saveFinalLicense = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId missing in request",
      });
    }

    const {
      licenseType,
      businessLocation,
      extractedData = {},
      finalizedData = {},
      documents = [],
    } = req.body;

    // Remove forbidden licenseNumber null values
    if (extractedData.licenseNumber === "" || extractedData.licenseNumber === null)
      delete extractedData.licenseNumber;

    if (finalizedData.licenseNumber === "" || finalizedData.licenseNumber === null)
      delete finalizedData.licenseNumber;

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
      message: `License created: ${licenseType}`,
      userId,
    });

    res.status(201).json({ success: true, data: newLicense });
  } catch (err) {
    console.error("SAVE LICENSE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================
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

// ================================================
const getCompanyLicenses = async (req, res) => {
  try {
    const data = await CoreCompanyLicense.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================
const getCompanyLicenseById = async (req, res) => {
  try {
    const data = await CoreCompanyLicense.findById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================
const deleteCompanyLicense = async (req, res) => {
  try {
    const userId = req.user?.id;

    await CoreCompanyLicense.findByIdAndDelete(req.params.id);

    await Notification.create({
      title: "License Deleted",
      message: "A license was removed.",
      userId,
    });

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  extractLicenseData,
  saveFinalLicense,
  updateLicense,
  getCompanyLicenses,
  getCompanyLicenseById,
  deleteCompanyLicense,
};
