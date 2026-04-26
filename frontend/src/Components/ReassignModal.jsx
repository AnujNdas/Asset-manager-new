// src/Components/ReassignModal.jsx

import React, { useEffect, useState } from "react";

import {
  getEmployees,
  reassignAssetInstance
} from "../Services/ApiServices";

const ReassignModal = ({ instance, onClose, refresh }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await getEmployees();
    setEmployees(res.data);
  };

  const handleSubmit = async () => {
    try {
      await reassignAssetInstance(instance._id, {
        newEmployeeId: selectedEmployee
      });

      refresh();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h2>Reassign Asset</h2>

        <select
          onChange={(e) => setSelectedEmployee(e.target.value)}
        >
          <option>Select Employee</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name}
            </option>
          ))}
        </select>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Cancel</button>
          <button className="btn-save" onClick={handleSubmit}>
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReassignModal;