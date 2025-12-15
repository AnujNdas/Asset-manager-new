const Status = require("../models/Status");

/* ============================
   Create Status
============================ */
const createStatus = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Status name is required" });
    }

    name = name.trim();

    // Case-insensitive duplicate check
    const exists = await Status.findOne({
      name: { $regex: `^${name}$`, $options: "i" }
    });

    if (exists) {
      return res.status(409).json({ message: "Status already exists" });
    }

    const newStatus = await Status.create({ name });

    res.status(201).json(newStatus);

  } catch (error) {
    console.error("Error creating status:", error);
    res.status(500).json({ messagel: "Error creating status" });
  }
};

/* ============================
   Update Status
============================ */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Status name is required" });
    }

    name = name.trim();

    // Prevent duplicates (excluding current record)
    const exists = await Status.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" }
    });

    if (exists) {
      return res.status(409).json({ message: "Status already exists" });
    }

    const updatedStatus = await Status.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedStatus) {
      return res.status(404).json({ message: "Status not found" });
    }

    res.status(200).json({
      message: "Status updated successfully",
      updatedStatus
    });

  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Error updating status" });
  }
};

/* ============================
   Get All Statuses
============================ */
const getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find().sort({ createdAt: -1 });
    res.status(200).json(statuses);
  } catch (error) {
    console.error("Error fetching statuses:", error);
    res.status(500).json({ message: "Error fetching statuses" });
  }
};

/* ============================
   Delete Status
============================ */
const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStatus = await Status.findByIdAndDelete(id);

    if (!deletedStatus) {
      return res.status(404).json({ message: "Status not found" });
    }

    res.status(200).json({
      message: "Status deleted successfully",
      deletedStatus
    });

  } catch (error) {
    console.error("Error deleting status:", error);
    res.status(500).json({ message: "Error deleting status" });
  }
};

module.exports = {
  createStatus,
  updateStatus,
  getStatuses,
  deleteStatus
};
