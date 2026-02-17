import React, { useState } from "react";
import { createEmployee } from "../../Services/ApiServices";

const AddEmployeeModal = ({ departments, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    employeeCode: "",
    departmentId: "",
    email: "",
    phone: ""
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await createEmployee(form);
    onSuccess();
    onClose();
  } catch (err) {
    alert(err.response?.data?.message || "Error creating employee");
  }
};


  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add Employee</h3>

        <form onSubmit={handleSubmit}>
          <input
            name="employeeCode"
            placeholder="Employee Code"
            required
            onChange={handleChange}
          />
          <input
            name="name"
            placeholder="Employee Name"
            required
            onChange={handleChange}
          />
          <select
            name="departmentId"
            required
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
            onChange={handleChange}
          />
          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
          />

          <div className="modal-buttons">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose} className="cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
