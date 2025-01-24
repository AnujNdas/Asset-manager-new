// controllers/unitController.js
const Unit = require('../models/Unit');

// Create a new unit
exports.createUnit = async (req, res) => {
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

// Get all units
exports.getUnits = async (req, res) => {
  try {
    const units = await Unit.find();
    res.status(200).json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ error: 'Error fetching units' });
  }
};

