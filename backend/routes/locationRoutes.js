// routes/locationRoutes.js
const express = require('express');
const { createLocation , getLocations , deleteLocation , updateLocation }= require('../controllers/locationControllers');
const router = express.Router();

// Route to create a location
router.post('/', createLocation);

// Route to get all locations
router.get('/', getLocations);

//Route to update locations 
router.put('/:id' , updateLocation )
// Route to delete locations
router.delete('/:id', deleteLocation);

module.exports = router;

