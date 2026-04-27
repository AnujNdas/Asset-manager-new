const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requireActiveSubscription = require("../middleware/requireActiveSubscription");
const { getTrackedInstance } = require("../controllers/publicControllers");
router.get(
  "/:id",
  authenticateToken(["admin", "user"]),
  tenantMiddleware,                // ✅ ADD THIS
  requireActiveSubscription,
  getPublicTrackedInstance
);
module.exports = router;