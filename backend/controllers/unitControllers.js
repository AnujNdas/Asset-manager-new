// controllers/unitController.js
const Unit = require('../models/Unit');

// Create a new unit
const createUnit = async (req, res) => {
  try {
    const { name } = req.body;
    const newUnit = new Unit({ name });
    await newUnit.save();
    res.status(201).json(newUnit);
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ error: 'Error creating unit' });
  }
};
// Update a unit
const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedUnit = await Unit.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedUnit) {
      return res.status(404).json({ error: "Unit not found" });
    }

    res.status(200).json({
      message: "Unit updated successfully",
      updatedUnit
    });

  } catch (error) {
    console.error("Error updating unit:", error);
    res.status(500).json({ error: "Error updating unit" });
  }
};

// Get all units
const getUnits = async (req, res) => {
  try {
    const units = await Unit.find();
    res.status(200).json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ error: 'Error fetching units' });
  }
};
 // Delete a category
const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUnit = await Unit.findByIdAndDelete(id);

    if (!deletedUnit) {
      return res.status(404).json({ error: "Unit not found" });
    }

    res.status(200).json({ message: "Unit deleted successfully", deletedUnit });
  } catch (error) {
    console.error("Error deleting unit:", error);
    res.status(500).json({ error: "Error deleting unit" });
  }
};

module.exports = {
 createUnit, 
 getUnits,
 deleteUnit,
  updateUnit
}
