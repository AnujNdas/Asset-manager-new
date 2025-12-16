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

    const existing = await Location.findOne({
      name: { $regex: `^${name}$`, $options: "i" }
    });

    // If exists but inactive → restore
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
        return res.status(200).json({
          message: "Location restored successfully",
          location: existing
        });
      }

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

    const exists = await Location.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" },
      isActive: true
    });

    if (exists) {
      return res.status(409).json({ message: "Location already exists" });
    }

    const updatedLocation = await Location.findOneAndUpdate(
      { _id: id, isActive: true },
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedLocation) {
      return res.status(404).json({ message: "Location not found or inactive" });
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
   Get Active Locations
============================ */
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ message: "Error fetching locations" });
  }
};

/* ============================
   Soft Delete Location
============================ */
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLocation = await Location.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

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

/* ============================
   Restore Location (Optional)
============================ */
const restoreLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const restored = await Location.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!restored) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json({
      message: "Location restored successfully",
      restored
    });
  } catch (error) {
    console.error("Error restoring location:", error);
    res.status(500).json({ message: "Error restoring location" });
  }
};

module.exports = {
  createLocation,
  updateLocation,
  getLocations,
  deleteLocation,
  restoreLocation
};
