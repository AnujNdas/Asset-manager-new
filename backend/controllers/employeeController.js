const Employee = require("../models/Employee");

/**
 * Create Employee
 */
const createEmployee = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const employee = await Employee.create({
      ...req.body,
      organizationId
    });

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Employees (with department filter optional)
 */
const getEmployees = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { departmentId } = req.query;

    const filter = { organizationId };

    if (departmentId) {
      filter.departmentId = departmentId;
    }

    const employees = await Employee.find(filter)
      .populate("departmentId", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createEmployee,
  getEmployees
};
