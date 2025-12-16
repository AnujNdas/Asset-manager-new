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

    // Check existing (case-insensitive)
    const existing = await Department.findOne({
      name: { $regex: `^${name}$`, $options: "i" }
    });

    if (existing) {
      if (!existing.isActive) {
        return res.status(409).json({
          error: "Department exists but is inactive. Please restore it."
        });
      }
      return res.status(409).json({ error: "Department already exists" });
    }

    const newDepartment = new Department({ name });
    await newDepartment.save();

    res.status(201).json(newDepartment);
  } catch (error) {
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

    // Duplicate name check (ignore self)
    const duplicate = await Department.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" }
    });

    if (duplicate) {
      return res.status(409).json({
        error: "Department name already exists"
      });
    }

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
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Error updating department" });
  }
};

/* ============================
   Get All Departments
   (Active + Inactive)
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
   Soft Delete Department
============================ */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({
      message: "Department deactivated successfully",
      department
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Error deleting department" });
  }
};

/* ============================
   Restore Department
============================ */
const restoreDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({
      message: "Department restored successfully",
      department
    });
  } catch (error) {
    console.error("Error restoring department:", error);
    res.status(500).json({ error: "Error restoring department" });
  }
};

module.exports = {
  createDepartment,
  updateDepartment,
  getDepartments,
  deleteDepartment,
  restoreDepartment
};
