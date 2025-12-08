// controllers/locationController.js
const Location = require('../models/Location');

// Create a new location
const createLocation = async (req, res) => {
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
// Update/edit a location
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedLocation) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.status(200).json({
      message: "Location updated successfully",
      updatedLocation
    });

  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ error: "Error updating location" });
  }
};
// Get all locations
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Error fetching locations' });
  }
};

// Delete a category
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLocation = await Location.findByIdAndDelete(id);

    if (!deletedLocation) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.status(200).json({ message: "Location deleted successfully", deletedLocation });
  } catch (error) {
    console.error("Error deleting Location:", error);
    res.status(500).json({ error: "Error deleting Location" });
  }
};

module.exports = {
 createLocation,
 getLocations,
 deleteLocation,
  updateLocation
}


