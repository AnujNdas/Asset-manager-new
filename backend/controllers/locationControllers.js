const Location = require("../models/Location");
const sendNotification = require("../utils/notify");

/* ============================
   Helpers
============================ */
const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ============================
   Create Location
============================ */
const createLocation = async (req, res) => {
  try {
    const { id: userId, organizationId } = req.user || {};

    if (!userId || !organizationId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location name is required"
      });
    }

    name = name.trim();

    const existing = await Location.findOne({
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
      organizationId
    });

    // Restore if inactive
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();

        await sendNotification({
          req,
          userId,
          title: "Location Restored",
          message: `Location "${existing.name}" has been restored.`,
          type: "success"
        });

        return res.status(200).json({
          success: true,
          data: existing
        });
      }

      return res.status(409).json({
        success: false,
        message: "Location already exists"
      });
    }

    const newLocation = await Location.create({
      name,
      organizationId,
      isActive: true
    });

    await sendNotification({
      req,
      userId,
      title: "Location Created",
      message: `Location "${newLocation.name}" was created successfully.`,
      type: "success"
    });

    return res.status(201).json({
      success: true,
      data: newLocation
    });
  } catch (error) {
    console.error("Create Location Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating location"
    });
  }
};

/* ============================
   Update Location
============================ */
const updateLocation = async (req, res) => {
  try {
    const { id: userId, organizationId } = req.user || {};
    const { id } = req.params;
    let { name } = req.body;

    if (!userId || !organizationId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location name is required"
      });
    }

    name = name.trim();

    const exists = await Location.findOne({
      _id: { $ne: id },
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
      organizationId,
      isActive: true
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Location already exists"
      });
    }

    const updatedLocation = await Location.findOneAndUpdate(
      { _id: id, organizationId, isActive: true },
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedLocation) {
      return res.status(404).json({
        success: false,
        message: "Location not found"
      });
    }

    await sendNotification({
      req,
      userId,
      title: "Location Updated",
      message: `Location renamed to "${updatedLocation.name}".`,
      type: "info"
    });

    return res.status(200).json({
      success: true,
      data: updatedLocation
    });
  } catch (error) {
    console.error("Update Location Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating location"
    });
  }
};

/* ============================
   Get Active Locations
============================ */
const getLocations = async (req, res) => {
  try {
    const { organizationId } = req.user || {};

    if (!organizationId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const locations = await Location.find({
      organizationId,
      isActive: true
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error("Get Locations Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching locations"
    });
  }
};

/* ============================
   Soft Delete Location
============================ */
const deleteLocation = async (req, res) => {
  try {
    const { id: userId, organizationId } = req.user || {};
    const { id } = req.params;

    if (!userId || !organizationId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const deletedLocation = await Location.findOneAndUpdate(
      { _id: id, organizationId },
      { isActive: false },
      { new: true }
    );

    if (!deletedLocation) {
      return res.status(404).json({
        success: false,
        message: "Location not found"
      });
    }

    await sendNotification({
      req,
      userId,
      title: "Location Deactivated",
      message: `Location "${deletedLocation.name}" has been deactivated.`,
      type: "warning"
    });

    return res.status(200).json({
      success: true,
      data: deletedLocation
    });
  } catch (error) {
    console.error("Delete Location Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting location"
    });
  }
};

/* ============================
   Restore Location
============================ */
const restoreLocation = async (req, res) => {
  try {
    const { id: userId, organizationId } = req.user || {};
    const { id } = req.params;

    if (!userId || !organizationId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const restoredLocation = await Location.findOneAndUpdate(
      { _id: id, organizationId },
      { isActive: true },
      { new: true }
    );

    if (!restoredLocation) {
      return res.status(404).json({
        success: false,
        message: "Location not found"
      });
    }

    await sendNotification({
      req,
      userId,
      title: "Location Restored",
      message: `Location "${restoredLocation.name}" has been restored.`,
      type: "success"
    });

    return res.status(200).json({
      success: true,
      data: restoredLocation
    });
  } catch (error) {
    console.error("Restore Location Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error restoring location"
    });
  }
};

/* ============================
   Exports
============================ */
module.exports = {
  createLocation,
  updateLocation,
  getLocations,
  deleteLocation,
  restoreLocation
};
