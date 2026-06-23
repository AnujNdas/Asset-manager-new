const express = require("express");
const router = express.Router();
const authenticationToken = require("../Middleware/Authentication-token");
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
  authenticationToken(["admin" , "user"]),
  getFinancialAudit
);
router.get(
    "/assets",
    authenticationToken(["admin" , "user"]),
    getAuditAssets
);
router.get(
    "/lifecycle",
    authenticationToken(["admin" , "user"]),
  getLifecycleAudit
);
module.exports = router;