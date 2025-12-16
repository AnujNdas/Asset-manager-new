const Unit = require("../models/Unit");

/* ============================
   Create / Restore Unit
============================ */
const createUnit = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Unit name is required" });
    }

    name = name.trim();

    const existing = await Unit.findOne({
      name: { $regex: `^${name}$`, $options: "i" }
    });

    // 🔁 Restore if soft deleted
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();

        return res.status(200).json({
          message: "Unit restored successfully",
          unit: existing
        });
      }

      return res.status(409).json({ message: "Unit already exists" });
    }

    const newUnit = await Unit.create({ name });

    res.status(201).json(newUnit);

  } catch (error) {
    console.error("Error creating unit:", error);
    res.status(500).json({ message: "Error creating unit" });
  }
};

/* ============================
   Update Unit
============================ */
const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Unit name is required" });
    }

    name = name.trim();

    const exists = await Unit.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" },
      isActive: true
    });

    if (exists) {
      return res.status(409).json({ message: "Unit already exists" });
    }

    const updatedUnit = await Unit.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedUnit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    res.status(200).json({
      message: "Unit updated successfully",
      updatedUnit
    });

  } catch (error) {
    console.error("Error updating unit:", error);
    res.status(500).json({ message: "Error updating unit" });
  }
};

/* ============================
   Get Active Units
============================ */
const getUnits = async (req, res) => {
  try {
    const units = await Unit.find().sort({
      name: 1
    });

    res.status(200).json(units);
  } catch (error) {
    console.error("Error fetching units:", error);
    res.status(500).json({ error: "Error fetching units" });
  }
};
;

/* ============================
   Soft Delete Unit
============================ */
const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const unit = await Unit.findById(id);

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    unit.isActive = false;
    await unit.save();

    res.status(200).json({
      message: "Unit deleted successfully",
      unit
    });

  } catch (error) {
    console.error("Error deleting unit:", error);
    res.status(500).json({ message: "Error deleting unit" });
  }
};

/* ============================
   Restore Unit
============================ */
const restoreUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const unit = await Unit.findById(id);

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    unit.isActive = true;
    await unit.save();

    res.status(200).json({
      message: "Unit restored successfully",
      unit
    });

  } catch (error) {
    console.error("Error restoring unit:", error);
    res.status(500).json({ message: "Error restoring unit" });
  }
};

module.exports = {
  createUnit,
  updateUnit,
  getUnits,
  deleteUnit,
  restoreUnit
};
