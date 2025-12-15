const Location = require("../models/Location");

/* ============================
   Create Location
============================ */
const createLocation = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Location name is required" });
    }

    name = name.trim();

    // Case-insensitive duplicate check
    const exists = await Location.findOne({
      name: { $regex: `^${name}$`, $options: "i" }
    });

    if (exists) {
      return res.status(409).json({ message: "Location already exists" });
    }

    const newLocation = await Location.create({ name });

    res.status(201).json(newLocation);

  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ message: "Error creating location" });
  }
};

/* ============================
   Update Location
============================ */
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Location name is required" });
    }

    name = name.trim();

    // Prevent duplicate names (excluding current record)
    const exists = await Location.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" }
    });

    if (exists) {
      return res.status(409).json({ message: "Location already exists" });
    }

    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json({
      message: "Location updated successfully",
      updatedLocation
    });

  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Error updating location" });
  }
};

/* ============================
   Get All Locations
============================ */
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 });
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ message: "Error fetching locations" });
  }
};

/* ============================
   Delete Location
============================ */
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLocation = await Location.findByIdAndDelete(id);

    if (!deletedLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json({
      message: "Location deleted successfully",
      deletedLocation
    });

  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ message: "Error deleting location" });
  }
};

module.exports = {
  createLocation,
  updateLocation,
  getLocations,
  deleteLocation
};
