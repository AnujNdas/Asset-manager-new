const SoftwareAsset = require("../models/SoftwareAsset");

const Notification = require("../models/Notification");
// Create a new software asset
const createSoftwareAsset = async (req, res) => {
  try {
    const userId = req.user?.id; // <-- ensure req.user exists
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: userId missing" });
    }

    const asset = new SoftwareAsset(req.body);
    await asset.save();

    // Create notification
    const newNotification = await Notification.create({
      title: "SoftwareAsset Added",
      message: "SoftwareAsset added successfully.",
      userId,
    });

    // Emit to user's room
    const io = req.app.get("io");
    io.to(userId.toString()).emit("newNotification", newNotification);

    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    console.error("Error in createSoftwareAsset:", err); // 👈 log full error
    res.status(500).json({ success: false, message: err.message });
  }
};


// Get all software assets
const getSoftwareAssets = async (req, res) => {
  try {
    const assets = await SoftwareAsset.find();
    res.json({ success: true, data: assets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single software asset
const getSoftwareAssetById = async (req, res) => {
  try {
    const asset = await SoftwareAsset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: "Software asset not found" });
    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update software asset
const updateSoftwareAsset = async (req, res) => {
  try {
    const userId = req.user.id;
    const asset = await SoftwareAsset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // Create notification
        const newNotification = await Notification.create({
          title: "SoftwareAsset Updated",
          message: "SoftwareAsset Updated successfully.",
          userId,
        });
    
       // Emit to user's room
        const io = req.app.get("io");
        io.to(userId.toString()).emit("newNotification", newNotification);
    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete software asset
const deleteSoftwareAsset = async (req, res) => {
  try {
    const userId = req.user.id;
    await SoftwareAsset.findByIdAndDelete(req.params.id);
    // Create notification
     const newNotification = await Notification.create({
       title: "SoftwareAsset Deleted",
       message: "SoftwareAsset Deleted successfully.",
       userId,
     });
 
    // Emit to user's room
     const io = req.app.get("io");
     io.to(userId.toString()).emit("newNotification", newNotification);
    res.json({ success: true, message: "Software asset deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createSoftwareAsset,
  getSoftwareAssets,
  getSoftwareAssetById,
  updateSoftwareAsset,
  deleteSoftwareAsset
};
