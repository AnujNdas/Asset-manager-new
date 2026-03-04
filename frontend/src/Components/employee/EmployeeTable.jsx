import React from "react";

const EmployeeTable = ({ employees }) => {
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
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp._id}>
              <td>{emp.employeeCode}</td>
              <td>{emp.name}</td>
              <td>{emp.departmentId?.name}</td>
              <td>{emp.email || "-"}</td>
              <td>{emp.phone || "-"}</td>
              <td>
                <span className={`status ${emp.status}`}>
                  {emp.status}
                </span>
              </td>
                    <td>
        <button onClick={() => onEdit(emp)}>Edit</button>
        <button onClick={() => onDelete(emp._id)}>Delete</button>
      </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
