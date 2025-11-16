const express = require("express");
const CoreCompanyLicense = require("../models/CoreCompanyLicense");
const {
  extractLicenseData,
  saveFinalLicense,
  updateLicense,
  getCompanyLicenses,
  getCompanyLicenseById,
  deleteCompanyLicense
} = require("../controllers/coreCompanyLicenseController");

const Status = require("../models/Status");
const authenticateToken = require("../Middleware/Authentication-token");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ------------------------------------------
// Ensure upload directory exists
// ------------------------------------------
const uploadDir = "uploads/licenses";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ------------------------------------------
// Multer Disk Storage Setup (IMPORTANT)
// ------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ------------------------------------------
// 1️⃣ OCR Extract Route
// FIELD NAME MUST BE: "file"
// ------------------------------------------
router.post(
  "/extract",
  upload.single("file"),
  extractLicenseData
);

// ------------------------------------------
// 2️⃣ Save final edited license
// ------------------------------------------
router.post(
  "/",
  authenticateToken(),  // 🔥 ADD BACK AUTH so req.user works
  saveFinalLicense
);


// ------------------------------------------
// 3️⃣ Get all licenses
// ------------------------------------------
router.get("/", authenticateToken(), getCompanyLicenses);

// ------------------------------------------
// 4️⃣ Get one license
// ------------------------------------------
router.get("/:id", authenticateToken(), getCompanyLicenseById);

// ------------------------------------------
// 5️⃣ Update license
// ------------------------------------------
router.put("/:id", authenticateToken(), updateLicense);

// ------------------------------------------
// 6️⃣ Delete license
// ------------------------------------------
router.delete("/:id", authenticateToken(), deleteCompanyLicense);

// ------------------------------------------
// 7️⃣ Bulk Upload
// ------------------------------------------
router.post("/bulk-upload", authenticateToken(), async (req, res) => {
  try {
    const { assets, mode } = req.body;

    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ success: false, message: "No core licenses provided" });
    }

    const statuses = await Status.find({});
    const statusMap = new Map(statuses.map(s => [s.name.toLowerCase(), s._id]));

    const formatted = [];

    for (const a of assets) {
      let statusId = statusMap.get(a["Status"]?.toLowerCase() || "");

      if (mode === "auto" && !statusId && a["Status"]) {
        try {
          const newStatus = await Status.create({ name: a["Status"] });
          statusId = newStatus._id;
          statusMap.set(a["Status"].toLowerCase(), statusId);
        } catch (err) {
          const existing = await Status.findOne({ name: a["Status"] });
          statusId = existing?._id;
          if (existing) statusMap.set(a["Status"].toLowerCase(), statusId);
        }
      }

      formatted.push({
        documentType: a["Document Type"] || "N/A",
        licenseNumber: a["License Number"] || "N/A",
        issuingAuthority: a["Issuing Authority"] || "N/A",
        licenseHolder: a["License Holder"] || "N/A",
        businessActivity: a["Business Activity"] || "N/A",
        issueDate: a["Issue Date"] ? new Date(a["Issue Date"]) : null,
        expiryDate: a["Expiry Date"] ? new Date(a["Expiry Date"]) : null,
        renewalCycle: a["Renewal Cycle"] || "Annual",
        reminderDaysBefore: Number(a["Reminder Days"] || 30),
        status: statusId || null,
      });
    }

    const inserted = await CoreCompanyLicense.insertMany(formatted, { ordered: false });

    res.status(201).json({
      success: true,
      insertedCount: inserted.length,
      mode: mode || "strict",
    });
  } catch (err) {
    console.error("Core License bulk upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
