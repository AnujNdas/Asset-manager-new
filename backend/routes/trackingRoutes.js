const express = require("express");
const router = express.Router();

const {
    getInstanceHistory,
    getTrackedInstances,
    upgradeInstance
} = require("../controllers/trackingControllers");
const authenticateToken = require("../Middleware/Authentication-token");
const tenantMiddleware = require("../Middleware/tenantMiddleware");
const requireActiveSubscription = require("../Middleware/requireActiveSubscription");

router.use(
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  requireActiveSubscription
);
router.get("/", getTrackedInstances);

// 🔥 FIXED
router.get("/:id/history", getInstanceHistory);

// 🔥 FIXED (PUT, not GET)
router.put("/:id/upgrade", upgradeInstance);