import React, { useState, useEffect } from "react";
import { createEmployee, updateEmployee } from "../../Services/ApiServices";

const AddEmployeeModal = ({ departments, employee, onClose, onSuccess }) => {

  const [form, setForm] = useState({
    name: "",
    employeeCode: "",
    departmentId: "",
    email: "",
    phone: ""
  });

  // 🔥 Prefill form when editing
  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name || "",
        employeeCode: employee.employeeCode || "",
        departmentId: employee.departmentId?._id || employee.departmentId || "",
        email: employee.email || "",
        phone: employee.phone || ""
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (employee) {
        // ✅ Edit Mode
        await updateEmployee(employee._id, form);
      } else {
        // ✅ Create Mode
        await createEmployee(form);
      }

      onSuccess();
      onClose();

    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{employee ? "Edit Employee" : "Add Employee"}</h3>

        <form onSubmit={handleSubmit}>
          <input
            name="employeeCode"
            placeholder="Employee Code"
            required
            value={form.employeeCode}
            onChange={handleChange}
          />

          <input
            name="name"
            placeholder="Employee Name"
            required
            value={form.name}
            onChange={handleChange}
          />

          <select
            name="departmentId"
            required
            value={form.departmentId}
            onChange={handleChange}
          >
            <option value="">Select Department</option>
            {departments.map(dep => (
              <option key={dep._id} value={dep._id}>
                {dep.name}
              </option>
            ))}
          </select>

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />

          <div className="modal-buttons">
            <button type="submit" className="btn-save">
              {employee ? "Update" : "Save"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;