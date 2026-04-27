import React, { useEffect, useState } from "react";
import EmployeeTable from "../Components/employee/EmployeeTable";
import EmployeeModal from "../Components/employee/EmployeeModal";
import { 
  getEmployees, 
  getDepartments,
  updateEmployee,
  deleteEmployee,
  getEmployeeSummary
} from "../Services/ApiServices";
// import {} from "../services/departmentService";
import "../Page_styles/Employee.css";
import Swal from "sweetalert2";
import Loader from "../Components/Loader";
const EmployeePage = () => {
  const [loading , setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeSummary, setEmployeeSummary] = useState([]);
const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "Delete Employee?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete"
  });

  if (!result.isConfirmed) return;

  await deleteEmployee(id);
  fetchEmployees();
};
const handleEdit = (employee) => {
  setEditingEmployee(employee);
  setShowModal(true);
};
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
const fetchEmployeeSummary = async () => {
  try {
    const res = await getEmployeeSummary();
    console.log("Fetched Employee Summary:", res.data);
    setEmployeeSummary(res.data);
  } catch (err) {
    console.error(err);
  }
};

// run once
useEffect(() => {
  fetchDepartments();
  fetchEmployeeSummary();
  setLoading(false)
}, []);

// run when filter changes
useEffect(() => {
  fetchEmployees();
  setLoading(false)
}, [departmentFilter]);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(search.toLowerCase())
  );
if (loading) return <Loader />
  return (
    <div className="employee-page">
      <div className="employee-header">
        <h2>Teams</h2>

        <div className="employee-actions">
          <input
            type="text"
            placeholder="Search team member..."
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

          <button onClick={() => setShowModal(true)} className="submit-btn">
            + Add Team Member
          </button>
        </div>
      </div>

    <EmployeeTable
  employees={filteredEmployees}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
<div className="team-assets-section">
  <h3>Team Asset Overview</h3>

  <div className="team-asset-grid">
    {employeeSummary.map((emp) => {

      const hardwareCost = emp.hardwareAssets.reduce(
        (sum, a) => sum + a.cost, 0
      );

      const softwareCost = emp.softwareAssets.reduce(
        (sum, a) => sum + a.cost, 0
      );

      const totalCost = hardwareCost + softwareCost;

      return (
        <div key={emp._id} className="team-asset-card">

          <div className="team-card-header">
            <h4>{emp.employeeName}</h4>
            <span>{emp.employeeCode}</span>
            <p>{emp.department}</p>
          </div>

          <div className="asset-section">

            <div>
              <h5>Hardware</h5>
              {emp.hardwareAssets.length === 0 ? (
                <p>No hardware</p>
              ) : (
                emp.hardwareAssets.map((a, i) => (
                  <div key={i} className="asset-item">
                    <span>{a.name}</span>
                    <span>Qty: {a.quantity}</span>
                    <span>${a.cost}</span>
                  </div>
                ))
              )}
            </div>

            <div>
              <h5>Software</h5>
              {emp.softwareAssets.length === 0 ? (
                <p>No software</p>
              ) : (
                emp.softwareAssets.map((a, i) => (
                  <div key={i} className="asset-item">
                    <span>{a.name}</span>
                    <span>Qty: {a.quantity}</span>
                    <span>${a.cost}</span>
                  </div>
                ))
              )}
            </div>

          </div>

          <div className="total-cost">
            Total Asset Value: ${totalCost}
          </div>

        </div>
      );
    })}
  </div>
</div>

      {showModal && (
<EmployeeModal
  departments={departments}
  employee={editingEmployee}   // pass employee for edit
  onClose={() => {
    setShowModal(false);
    setEditingEmployee(null);
  }}
  onSuccess={() => {
    fetchEmployees();
    setEditingEmployee(null);
  }}
/>
      )}
    </div>
  );
};

export default EmployeePage;
