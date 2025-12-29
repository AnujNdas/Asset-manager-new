// routes/locationRoutes.js
const express = require('express');
const authenticateToken = require("../Middleware/Authentication-token");
const { createLocation , getLocations , deleteLocation , updateLocation ,restoreLocation }= require('../controllers/locationControllers');
const router = express.Router();

// Route to create a location
router.post('/', authenticateToken(["admin", "super-admin"]), createLocation);

// Route to get all locations
router.get('/', getLocations);

//Route to update locations 
router.put('/:id' , authenticateToken(["admin", "super-admin"]), updateLocation )
// Route to delete locations
router.delete('/:id', authenticateToken(["admin", "super-admin"]), deleteLocation);
router.patch("/:id/restore", authenticateToken(["admin", "super-admin"]), restoreLocation);
module.exports = router;

