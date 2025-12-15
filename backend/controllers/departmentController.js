const Department = require("../models/Department");

/* ============================
   Create Department
============================ */
const createDepartment = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Department name is required" });
    }

    name = name.trim();

    const newDepartment = new Department({ name });
    await newDepartment.save();

    res.status(201).json(newDepartment);

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Department already exists"
      });
    }

    console.error("Error creating department:", error);
    res.status(500).json({ error: "Error creating department" });
  }
};

/* ============================
   Update Department
============================ */
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Department name is required" });
    }

    name = name.trim();

    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({
      message: "Department updated successfully",
      updatedDepartment
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Department already exists"
      });
    }

    console.error("Error updating department:", error);
    res.status(500).json({ error: "Error updating department" });
  }
};

/* ============================
   Get All Departments
============================ */
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Error fetching departments" });
  }
};

/* ============================
   Delete Department
============================ */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDepartment = await Department.findByIdAndDelete(id);

    if (!deletedDepartment) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({
      message: "Department deleted successfully",
      deletedDepartment
    });

  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Error deleting department" });
  }
};

module.exports = {
  createDepartment,
  updateDepartment,
  getDepartments,
  deleteDepartment
};
