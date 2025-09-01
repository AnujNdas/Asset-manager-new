const express = require("express");
const {
  createCompanyLicense,
  getCompanyLicenses,
  getCompanyLicenseById,
  updateCompanyLicense,
  deleteCompanyLicense
} = require("../controllers/coreCompanyLicenseController");

const router = express.Router();

router.post("/", createCompanyLicense);
router.get("/", getCompanyLicenses);
router.get("/:id", getCompanyLicenseById);
router.put("/:id", updateCompanyLicense);
router.delete("/:id", deleteCompanyLicense);

module.exports = router;

