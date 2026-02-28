// routes/unitRoutes.js
const express = require("express");
const router = express.Router();

const {
  createUnit,
  updateUnit,
  getUnits,
  deleteUnit,
  restoreUnit
} = require("../controllers/unitControllers");

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

router.post("/", createUnit);
router.get("/", getUnits);
router.put("/:id", updateUnit);
router.delete("/:id", deleteUnit);
router.patch("/:id/restore", restoreUnit);

module.exports = router;