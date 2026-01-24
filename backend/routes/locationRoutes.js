// routes/locationRoutes.js
const express = require('express');
const authenticateToken = require("../Middleware/Authentication-token");
const { createLocation , getLocations , deleteLocation , updateLocation ,restoreLocation }= require('../controllers/locationControllers');
const router = express.Router();

// Route to create a location
router.post('/', authenticateToken(["admin", "user"]), createLocation);

// Route to get all locations
router.get('/', authenticateToken(["admin", "user"]), getLocations);

//Route to update locations 
router.put('/:id' , authenticateToken(["admin", "user"]), updateLocation )
// Route to delete locations
router.delete('/:id', authenticateToken(["admin", "user"]), deleteLocation);
router.patch("/:id/restore", authenticateToken(["admin", "user"]), restoreLocation);
module.exports = router;

