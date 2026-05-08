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
    setDepartments(res.data || []);
  };

  const fetchEmployees = async (departmentId) => {
    const res = await getEmployees({
      departmentId
    });

    setEmployees(res.data || []);
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
      newLocation: location
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

          {employees.map((emp) => (
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