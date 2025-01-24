// controllers/locationController.js
const Location = require('../models/Location');

// Create a new location
exports.createLocation = async (req, res) => {
  try {
    const { name } = req.body;
    const newLocation = new Location({ name });
    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Error creating location' });
  }
};

// Get all locations
exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Error fetching locations' });
  }
};


