import React, { useEffect, useState } from "react";
import EmployeeTable from "../Components/employees/EmployeeTable";
import EmployeeModal from "../Components/employees/EmployeeModal";
import { getEmployees, getDepartments  } from "../Services/ApiServices";
// import {} from "../services/departmentService";
import "../Page_styles/Employee.css";

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

const fetchEmployees = async () => {
  try {
    const res = await getEmployees(departmentFilter);
    setEmployees(res.data); // backend structure
    console.log("Fetched Employees:", res.data);
  } catch (err) {
    console.error(err);
  }
};

const fetchDepartments = async () => {
  try {
    const res = await getDepartments();
    setDepartments(res);   // ✅ NOT res.data
    console.log("Fetched Departments:", res);
  } catch (err) {
    console.error("Fetch Departments Error:", err);
  }
};


  useEffect(() => {
    fetchEmployees();
  }, [departmentFilter]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="employee-page">
      <div className="employee-header">
        <h2>Employees</h2>

        <div className="employee-actions">
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dep => (
              <option key={dep._id} value={dep._id}>
                {dep.name}
              </option>
            ))}
          </select>

          <button onClick={() => setShowModal(true)}>
            + Add Employee
          </button>
        </div>
      </div>

      <EmployeeTable employees={filteredEmployees} />

      {showModal && (
        <EmployeeModal
          departments={departments}
          onClose={() => setShowModal(false)}
          onSuccess={fetchEmployees}
        />
      )}
    </div>
  );
};

export default EmployeePage;
