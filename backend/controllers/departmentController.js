const Department = require("../models/Department");
const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ============================
   Create Department
============================ */
const createDepartment = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Department name is required" });
    }

    name = name.trim();
    const safeName = escapeRegex(name);

    const exists = await Department.findOne({
      name: { $regex: `^${safeName}$`, $options: "i" }
    });

    if (exists) {
      return res.status(409).json({ message: "Department already exists" });
    }

    const newDepartment = await Department.create({ name });

    res.status(201).json(newDepartment);
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Error creating department" });
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
      return res.status(400).json({ message: "Department name is required" });
    }

    name = name.trim();
    const safeName = escapeRegex(name);

    const exists = await Department.findOne({
      _id: { $ne: id },
      name: { $regex: `^${safeName}$`, $options: "i" }
    });

    if (exists) {
      return res.status(409).json({ message: "Department already exists" });
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({
      message: "Department updated successfully",
      updatedDepartment
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ message: "Error updating department" });
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
    res.status(500).json({ message: "Error fetching departments" });
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
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({
      message: "Department deleted successfully",
      deletedDepartment
    });

  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ message: "Error deleting department" });
  }
};

module.exports = {
  createDepartment,
  updateDepartment,
  getDepartments,
  deleteDepartment
};
