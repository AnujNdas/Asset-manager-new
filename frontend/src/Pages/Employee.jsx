import React, { useEffect, useState } from "react";
import EmployeeTable from "../Components/employee/EmployeeTable";
import EmployeeModal from "../Components/employee/EmployeeModal";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../Components/CurrencyFilter";
import { 
  getEmployees, 
  getDepartments,
  updateEmployee,
  deleteEmployee,
  getEmployeeSummary
} from "../Services/ApiServices";
// import {} from "../services/departmentService";
import "../Page_styles/Employee.css";
import Pagination from "../Components/Pagination";
import ThemeSwal from "../utils/SwalTheme";
import Loader from "../Components/Loader";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTour } from "../Context/TourContext";
const EmployeePage = () => {
      const { registerTour } = useTour();
 const { currency, convertFromBase, loadingRates } = useCurrency();
  const [loading , setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeSummary, setEmployeeSummary] = useState([]);
  // 🔹 Employee Table
const [empPage, setEmpPage] = useState(1);
const employeesPerPage = 8;

// 🔹 Team Asset Overview
const [summaryPage, setSummaryPage] = useState(1);
const summaryPerPage = 6;

      const driverObj = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,
        allowClose: true,
    
        overlayColor: "rgba(0,0,0,0.75)",
    
        popoverClass: "custom-driver-popover",
    
        steps: [
                  {
            element: ".tour-search",
            popover: {
              title: "Search",
              description:
                "Search team members.",
              side: "bottom",
            },
          },
          {
            element: ".tour-department",
            popover: {
              title: "Department Selector",
              description: "Select department.",
              side: "bottom",
              align: "start",
            },
          },
    
          {
            element: ".tour-add",
            popover: {
              title: "Add Team member",
              description:
                "Add Team Member to a specific department.",
              side: "bottom",
            },
          },
  
          {
            element: ".tour-member-info",
            popover: {
              title: "Assignment information",
              description:
                "contains assignement related information of the instances.",
              side: "bottom",
            },
          },
        ],
      });
    
      useEffect(() => {
        const seen = localStorage.getItem("inventoryTourSeen");
      
        if (!seen) {
          setTimeout(() => {
            driverObj.drive();
      
            localStorage.setItem(
              "inventoryTourSeen",
              "true"
            );
          }, 1000);
        }
      }, []);
      useEffect(() => {
      registerTour(driverObj);
    }, []);

useEffect(() => {
  setEmpPage(1);
}, [search, departmentFilter]);
useEffect(() => {
  setSummaryPage(1);
}, [employeeSummary]);
const handleDelete = async (id) => {
  const result = await ThemeSwal.fire({
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
const summaryIndexLast = summaryPage * summaryPerPage;

const paginatedSummary = employeeSummary.slice(
  summaryIndexLast - summaryPerPage,
  summaryIndexLast
);

const totalSummaryPages = Math.ceil(
  employeeSummary.length / summaryPerPage
);
// run once
useEffect(() => {
  const init = async () => {
    setLoading(true);
    await Promise.all([
      fetchDepartments(),
      fetchEmployeeSummary()
    ]);
    setLoading(false);
  };

  init();
}, []);
// run when filter changes
useEffect(() => {
  const loadEmployees = async () => {
    setLoading(true);
    await fetchEmployees();
    setLoading(false);
  };

  loadEmployees();
}, [departmentFilter]);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(search.toLowerCase())
  );
  const empIndexLast = empPage * employeesPerPage;

const paginatedEmployees = filteredEmployees.slice(
  empIndexLast - employeesPerPage,
  empIndexLast
);

const totalEmpPages = Math.ceil(
  filteredEmployees.length / employeesPerPage
);
if (loading) return <Loader />
if (loadingRates) return <Loader />;
  return (
    <div className="employee-page">
      <div className="employee-header">
        <h2>Teams</h2>

        <div className="employee-actions">
          <input
          className="tour-search"
            type="text"
            placeholder="Search team member..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select
          className="tour-department"
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

          <button onClick={() => setShowModal(true)} className="submit-btn tour-add">
            + Add Team Member
          </button>
        </div>
      </div>
<EmployeeTable
  employees={paginatedEmployees}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
<Pagination
  currentPage={empPage}
  totalPages={totalEmpPages}
  onPageChange={setEmpPage}
/>
<div className="team-assets-section">
  <h3>Team Asset Overview</h3>

  <div className="team-asset-grid">
{paginatedSummary.map((emp) => {

    const hardware = emp.hardware || {};
    const software = emp.software || {};

    const totalCost = emp.totalCost || 0;

      return (
<div key={emp._id} className="team-asset-card  tour-member-info">

  <div className="team-card-header">
    <h4>{emp.employeeName}</h4>
    <span>{emp.employeeCode}</span>
    <p>{emp.department}</p>
  </div>

  <div className="asset-section">

    <div>
      <h5>Hardware</h5>
      <p>Assets: {hardware.assetCount || 0}</p>
      <p>Instances: {hardware.instanceCount || 0}</p>
      <p>
  Value: {CURRENCY_SYMBOLS[currency]}{" "}
  {convertFromBase(hardware.totalCost || 0)}
</p>
    </div>

    <div>
      <h5>Software</h5>
      <p>Assets: {software.assetCount || 0}</p>
      <p>Instances: {software.instanceCount || 0}</p>
      <p>
  Value: {CURRENCY_SYMBOLS[currency]}{" "}
  {convertFromBase(software.totalCost || 0)}
</p>
    </div>

  </div>

  {/* ✅ FIXED POSITION */}
<div className="total-cost">
  Total Asset Value: {CURRENCY_SYMBOLS[currency]}{" "}
  {convertFromBase(totalCost)}
</div>
</div>
      );
    })}
  </div>
  <Pagination
  currentPage={summaryPage}
  totalPages={totalSummaryPages}
  onPageChange={setSummaryPage}
/>
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
