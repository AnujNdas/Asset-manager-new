const express = require("express");
const router = express.Router();
const authenticateToken = require("../Middleware/Authentication-token");
const {
  getAuditDashboard,
    getFinancialAudit,
    getAuditAssets,
    getLifecycleAudit
} = require("../controllers/auditControllers");

router.get(
  "/dashboard",
  authenticateToken(["admin", "user"]),
  getAuditDashboard
);
router.get(
  "/financial",
  authenticateToken(["admin" , "user"]),
  getFinancialAudit
);
router.get(
    "/assets",
    authenticateToken(["admin" , "user"]),
    getAuditAssets
);
router.get(
    "/lifecycle",
    authenticateToken(["admin" , "user"]),
  getLifecycleAudit
);
module.exports = router;