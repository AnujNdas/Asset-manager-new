const Status = require('../models/Status');

// Create a new status
const createStatus = async (req, res) => {
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
const getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find();
    res.status(200).json(statuses);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    res.status(500).json({ error: 'Error fetching statuses' });
  }
};
// Delete a category
const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStatus = await Status.findByIdAndDelete(id);

    if (!deletedStatue) {
      return res.status(404).json({ error: "Status not found" });
    }

    res.status(200).json({ message: "Status deleted successfully", deletedStatus });
  } catch (error) {
    console.error("Error deleting status:", error);
    res.status(500).json({ error: "Error deleting status" });
  }
};

module.exports = {
 createStatus,
 getStatuses, 
 deleteStatus 
}