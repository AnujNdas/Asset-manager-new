// routes/locationRoutes.js
const express = require("express");
const authenticateToken = require("../Middleware/Authentication-token");
const tenantMiddleware = require("../Middleware/tenantMiddleware");
const requireActiveSubscription = require("../Middleware/requireActiveSubscription");

const {
  createLocation,
  getLocations,
  deleteLocation,
  updateLocation,
  restoreLocation
} = require("../controllers/locationControllers");

const router = express.Router();

/* ----------------------------------
   GLOBAL PROTECTION FOR THIS ROUTER
----------------------------------- */
router.use(
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  requireActiveSubscription
);

// Route to create a location
router.post("/", createLocation);

// Route to get all locations
router.get("/", getLocations);

// Route to update location
router.put("/:id", updateLocation);

// Route to delete location
router.delete("/:id", deleteLocation);

// Route to restore location
router.patch("/:id/restore", restoreLocation);

module.exports = router;