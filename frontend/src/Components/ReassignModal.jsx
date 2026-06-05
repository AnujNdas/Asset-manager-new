import React, { useEffect, useState } from "react";

import {
  getDepartments,
  getEmployees,
  reassignAssetInstance
} from "../Services/ApiServices";

const ReassignModal = ({
  assignment,
  onClose,
  refresh
}) => {

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [location, setLocation] = useState("");
  const [reassignmentDate, setReassignmentDate] = useState(
  new Date().toISOString().split("T")[0]
);
  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchEmployees(selectedDepartment);
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    const res = await getDepartments();
    console.log("Departments:", res);
    setDepartments(res || []);
  };

const fetchEmployees = async (departmentId) => {
  try {
    const res = await getEmployees(departmentId);

    console.log("Employees:", res);

    // ✅ handle API response safely
    setEmployees(
      Array.isArray(res)
        ? res
        : res?.data || []
    );

  } catch (err) {
    console.error(err);
    setEmployees([]);
  }
};
const handleSubmit = async () => {
  try {

    if (!selectedDepartment) {
      return alert("Select department");
    }

    if (!selectedEmployee) {
      return alert("Select employee");
    }

    if (!location.trim()) {
      return alert("Location required");
    }

await reassignAssetInstance(assignment._id, {
  newEmployeeId: selectedEmployee,
  newDepartmentId: selectedDepartment,
  newLocation: location,
  reassignmentDate
});

    refresh();
    onClose();

  } catch (err) {
    console.error(err);
  }
};
  const handleDepartmentChange = async (id) => {
  setSelectedDepartment(id);
  setSelectedEmployee("");

  await fetchEmployees(id);
};
  return (
    <div className="modal-overlay">
      <div className="modal">

        <h2>Reassign Asset</h2>

        {/* DEPARTMENT */}
        <select
          value={selectedDepartment}
            onChange={(e) =>
              handleDepartmentChange(e.target.value)
            }
        >
          <option value="">
            Select Department
          </option>

          {departments.map((dept) => (
            <option
              key={dept._id}
              value={dept._id}
            >
              {dept.name}
            </option>
          ))}
        </select>

        {/* EMPLOYEE */}
        <select
          value={selectedEmployee}
          onChange={(e) =>
            setSelectedEmployee(e.target.value)
          }
        >
          <option value="">
            Select Employee
          </option>

{Array.isArray(employees) &&
  employees.map((emp) => (
    <option
      key={emp._id}
      value={emp._id}
    >
      {emp.name}
    </option>
))}
        </select>

        {/* LOCATION */}
        <input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
        />

        {/* REASSIGNMENT DATE */}
<div className="input-group">
  <label>Reassignment Date</label>

  <input
    type="date"
    value={reassignmentDate}
    onChange={(e) =>
      setReassignmentDate(e.target.value)
    }
  />
</div>

        <div className="modal-actions">

          <button
            onClick={onClose}
            className="btn-cancel"
          >
            Cancel
          </button>

          <button
            className="btn-save"
            onClick={handleSubmit}
          >
            Confirm
          </button>

        </div>
      </div>
    </div>
  );
};

export default ReassignModal;