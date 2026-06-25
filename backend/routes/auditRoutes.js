const express = require("express");
const router = express.Router();
const authenticateToken = require("../Middleware/Authentication-token");
const {
  getCompleteAuditDashboard
} = require("../controllers/auditControllers");

router.get(
  "/",
  authenticateToken(["admin", "user"]),
  getCompleteAuditDashboard
);

module.exports = router;