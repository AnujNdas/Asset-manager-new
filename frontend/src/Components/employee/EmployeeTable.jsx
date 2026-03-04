import React from "react";

const EmployeeTable = ({ employees, onEdit, onDelete }) => {
  return (
    <div className="employee-table">
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Department</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                No employees found
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.employeeCode}</td>
                <td>{emp.name}</td>
                <td>{emp.departmentId?.name || "-"}</td>
                <td>{emp.email || "-"}</td>
                <td>{emp.phone || "-"}</td>
                <td>
                  <span className={`status ${emp.status || "active"}`}>
                    {emp.status || "Active"}
                  </span>
                </td>

                <td className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => onEdit(emp)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => onDelete(emp._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;