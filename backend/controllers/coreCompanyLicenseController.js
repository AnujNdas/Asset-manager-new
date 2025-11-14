const CoreCompanyLicense = require("../models/CoreCompanyLicense");
const Notification = require("../models/Notification");
const extractTextFromFile = require("../utils/extractTextFromFile"); 

// Extract fields from uploaded document
const extractLicenseData = async (req, res) => {
  try {
    const { licenseType, businessLocation } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Perform OCR / text extraction
    const extractedText = await extractTextFromFile(req.file);

    // TODO: We will create dynamic field extractors per licenseType
    const extractedFields = parseExtractedText(licenseType, extractedText);

    return res.status(200).json({
      success: true,
      extractedData: extractedFields,
    });

  } catch (err) {
    console.error("OCR Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new company license
const saveFinalLicense = async (req, res) => {
  try {
    const userId = req.user?.id;

    const {
      licenseType,
      businessLocation,
      extractedData,
      finalizedData,
      documents
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

    // Send notification
    await Notification.create({
      title: "New License Added",
      message: `License created of type ${licenseType}`,
      userId,
    });

    return res.status(201).json({ success: true, data: newLicense });

  } catch (err) {
    console.error("Error saving license:", err);
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
      return res.status(404).json({ success: false, message: "License not found" });
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
  extractLicenseData,
  saveFinalLicense,
  updateLicense,
  getCompanyLicenses,
  getCompanyLicenseById,
  deleteCompanyLicense,
};

