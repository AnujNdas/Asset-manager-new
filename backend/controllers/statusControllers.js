const Status = require('../models/Status');

// Create a new status
exports.createStatus = async (req, res) => {
  try {
    const { name } = req.body;
    const newStatus = new Status({ name });
    await newStatus.save();
    res.status(201).json(newStatus);
  } catch (error) {
    console.error('Error creating status:', error);
    res.status(500).json({ error: 'Error creating status' });
  }
};

// Get all statuses
exports.getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find();
    res.status(200).json(statuses);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    res.status(500).json({ error: 'Error fetching statuses' });
  }
};

