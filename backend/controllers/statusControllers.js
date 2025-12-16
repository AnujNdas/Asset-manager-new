const Status = require("../models/Status");

/* ============================
   Create / Restore Status
============================ */
const createStatus = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Status name is required" });
    }

    name = name.trim();

    const existing = await Status.findOne({
      name: { $regex: `^${name}$`, $options: "i" }
    });

    // 🔁 Restore if soft deleted
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();

        return res.status(200).json({
          message: "Status restored successfully",
          status: existing
        });
      }

      return res.status(409).json({ message: "Status already exists" });
    }

    const newStatus = await Status.create({ name });

    res.status(201).json(newStatus);

  } catch (error) {
    console.error("Error creating status:", error);
    res.status(500).json({ message: "Error creating status" });
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

    const exists = await Status.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" },
      isActive: true
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
   Get Active Statuses
============================ */
const getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json(statuses);
  } catch (error) {
    console.error("Error fetching statuses:", error);
    res.status(500).json({ message: "Error fetching statuses" });
  }
};

/* ============================
   Soft Delete Status
============================ */
const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const status = await Status.findById(id);

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    status.isActive = false;
    await status.save();

    res.status(200).json({
      message: "Status deleted successfully",
      status
    });

  } catch (error) {
    console.error("Error deleting status:", error);
    res.status(500).json({ message: "Error deleting status" });
  }
};

/* ============================
   Restore Status (Optional)
============================ */
const restoreStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const status = await Status.findById(id);

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    status.isActive = true;
    await status.save();

    res.status(200).json({
      message: "Status restored successfully",
      status
    });

  } catch (error) {
    console.error("Error restoring status:", error);
    res.status(500).json({ message: "Error restoring status" });
  }
};

module.exports = {
  createStatus,
  updateStatus,
  getStatuses,
  deleteStatus,
  restoreStatus
};
