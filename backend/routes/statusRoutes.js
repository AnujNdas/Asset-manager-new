// routes/statusRoutes.js
const express = require("express");
const router = express.Router();

const {
  createStatus,
  updateStatus,
  getStatuses,
  deleteStatus,
  restoreStatus
} = require("../controllers/statusControllers");

const authenticateToken = require("../Middleware/Authentication-token");
const tenantMiddleware = require("../Middleware/tenantMiddleware");
const requireActiveSubscription = require("../Middleware/requireActiveSubscription");

/* ----------------------------------
   GLOBAL PROTECTION FOR THIS ROUTER
----------------------------------- */
router.use(
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  requireActiveSubscription
);

router.post("/", createStatus);
router.get("/", getStatuses);
router.put("/:id", updateStatus);
router.delete("/:id", deleteStatus);
router.patch("/:id/restore", restoreStatus);

module.exports = router;