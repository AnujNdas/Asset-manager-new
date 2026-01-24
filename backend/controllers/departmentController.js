const Department = require("../models/Department");
const sendNotification = require("../utils/notify");

/* ============================
   Create Department
============================ */
const createDepartment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Department name is required" });
    }

    name = name.trim();

    const existing = await Department.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      organizationId,
    });

    if (existing) {
      if (!existing.isActive) {
        return res.status(409).json({
          error: "Department exists but is inactive. Please restore it.",
        });
      }

      return res.status(409).json({
        error: "Department already exists",
      });
    }

    const newDepartment = await Department.create({
      name,
      organizationId,
      isActive: true,
      createdBy: userId,
    });

    await sendNotification({
      req,
      userId,
      title: "Department Created",
      message: `Department "${newDepartment.name}" was created successfully.`,
      type: "success",
    });

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
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Department name is required" });
    }

    name = name.trim();

    const duplicate = await Department.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" },
      organizationId,
      isActive: true,
    });

    if (duplicate) {
      return res.status(409).json({
        error: "Department name already exists",
      });
    }

    const updatedDepartment = await Department.findOneAndUpdate(
      { _id: id, organizationId, isActive: true },
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ error: "Department not found" });
    }

    await sendNotification({
      req,
      userId,
      title: "Department Updated",
      message: `Department renamed to "${updatedDepartment.name}".`,
      type: "info",
    });

    res.status(200).json({
      message: "Department updated successfully",
      updatedDepartment,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Error updating department" });
  }
};

/* ============================
   Get All Departments
============================ */
const getDepartments = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const departments = await Department.find({
      organizationId,
    }).sort({ createdAt: -1 });

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
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const department = await Department.findOneAndUpdate(
      { _id: id, organizationId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    await sendNotification({
      req,
      userId,
      title: "Department Deactivated",
      message: `Department "${department.name}" has been deactivated.`,
      type: "warning",
    });

    res.status(200).json({
      message: "Department deactivated successfully",
      department,
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
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const department = await Department.findOneAndUpdate(
      { _id: id, organizationId, isActive: false },
      { isActive: true },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    await sendNotification({
      req,
      userId,
      title: "Department Restored",
      message: `Department "${department.name}" has been restored.`,
      type: "success",
    });

    res.status(200).json({
      message: "Department restored successfully",
      department,
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
  restoreDepartment,
};
