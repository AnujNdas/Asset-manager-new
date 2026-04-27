const express = require("express");
const router = express.Router();
const authenticateToken = require("../Middleware/Authentication-token");
const tenantMiddleware = require("../Middleware/tenantMiddleware");
const requireActiveSubscription = require("../Middleware/requireActiveSubscription");
const { getTrackedInstance } = require("../controllers/publicControllers");
router.get(
  "/:id",
  authenticateToken(["admin", "user"]),
  tenantMiddleware,                // ✅ ADD THIS
  requireActiveSubscription,
  getTrackedInstance
);
module.exports = router;