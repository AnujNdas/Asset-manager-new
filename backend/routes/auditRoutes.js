const express = require("express");
const router = express.Router();

const {
  getAuditDashboard,
    getFinancialAudit,
    getAuditAssets,
    getLifecycleAudit
} = require("../controllers/auditControllers");

router.get(
  "/dashboard",
  getAuditDashboard
);
router.get(
  "/financial",
  getFinancialAudit
);
router.get(
  "/assets",
  getAuditAssets
);
router.get(
  "/lifecycle",
  getLifecycleAudit
);
module.exports = router;