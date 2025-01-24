// routes/locationRoutes.js
const express = require('express');
const locationController = require('../controllers/locationControllers');
const router = express.Router();

// Route to create a location
router.post('/', locationController.createLocation);

// Route to get all locations
router.get('/', locationController.getLocations);

module.exports = router;

