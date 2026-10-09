import React, {
  useEffect,
  useState,
  useMemo
} from "react";
import {
  FiSearch,
  FiX,
  FiFilter,
  FiChevronDown,
  FiPlus,
  FiUsers,
  FiLayers,
  FiUser,
  FiBriefcase,
  FiHardDrive,
  FiMonitor,
  FiDollarSign,
  FiPackage,
} from "react-icons/fi";
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
import "../Page_styles/TestEmployeeFile.css";
import Pagination from "../Components/Pagination";
import ThemeSwal from "../utils/swalTheme";
import Loader from "../Components/Loader";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTour } from "../Context/TourContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useOrganization } from "../Context/OrganizationContext";
import { CURRENCY_SYMBOLS } from "../utils/currency.js";
const EmployeePage = () => {
  const { organization } = useOrganization();
  const CurrencySymbol = CURRENCY_SYMBOLS[organization?.currency] || "$";
  const location = useLocation();
  const navigate = useNavigate();

  const { registerTour, startTour } = useTour();
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

const driverObj = useMemo(() => {
  return driver({
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
            "contains assignment related information of the instances.",
          side: "bottom",

          onNextClick: () => {
            driverObj.destroy();

            localStorage.setItem(
              "teamTourSeen",
              "true"
            );

            navigate("/dashboard");
          },
        },
      },
    ],
  });
}, [navigate]);
useEffect(() => {
  registerTour(driverObj);

  const shouldStart =
    location.state?.startGuide &&
    !localStorage.getItem("teamTourSeen");

  if (shouldStart) {
    setTimeout(() => {
      startTour(() => {
        localStorage.setItem(
          "teamTourSeen",
          "true"
        );

        navigate("/dashboard");
      });
    }, 700);
  }
}, [driverObj]);  

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
  return (

<div className="employee-page">

  {/* =====================================================
      PAGE HEADER
  ===================================================== */}

  <div className="employee-header">

    <div className="employee-header-top">

      <div className="employee-header-info">

        <span className="employee-eyebrow">
          WORKFORCE MANAGEMENT
        </span>

        <h2>Teams</h2>

        <p>
          Manage team members, departments, and
          assigned asset values.
        </p>

      </div>

      <div className="employee-header-counter">

        <span>Team Members</span>

        <strong>
          {employees.length}
        </strong>

      </div>

    </div>


    {/* =====================================================
        SEARCH / FILTER / ADD
    ===================================================== */}

    <div className="employee-actions">

      <div className="employee-search-wrapper">

        <FiSearch className="employee-search-icon" />

        <input
          className="tour-search employee-search-input"
          type="text"
          placeholder="Search team member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (

          <button
            type="button"
            className="employee-search-clear"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <FiX />
          </button>

        )}

      </div>


      <div className="employee-department-wrapper">

        <FiFilter className="employee-department-icon" />

        <select
          className="tour-department employee-department-select"
          value={departmentFilter}
          onChange={(e) =>
            setDepartmentFilter(e.target.value)
          }
        >

          <option value="">
            All Departments
          </option>

          {departments.map((dep) => (

            <option
              key={dep._id}
              value={dep._id}
            >
              {dep.name}
            </option>

          ))}

        </select>

        <FiChevronDown className="employee-select-chevron" />

      </div>


      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="submit-btn tour-add employee-add-btn"
      >

        <FiPlus />

        <span>Add Team Member</span>

      </button>

    </div>

  </div>


  {/* =====================================================
      EMPLOYEE DIRECTORY
  ===================================================== */}

  <section className="employee-directory-section">

    <div className="employee-section-header">

      <div className="employee-section-heading">

        <span className="employee-section-eyebrow">
          TEAM DIRECTORY
        </span>

        <h3>Team Members</h3>

        <p>
          View and manage your organization's employees.
        </p>

      </div>

      <span className="employee-section-count">
        <FiUsers />
        {paginatedEmployees.length} Displayed
      </span>

    </div>


    <div className="employee-table-container">

      <EmployeeTable
        employees={paginatedEmployees}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

    </div>


    <div className="employee-pagination-wrapper">

      <Pagination
        currentPage={empPage}
        totalPages={totalEmpPages}
        onPageChange={setEmpPage}
      />

    </div>

  </section>


  {/* =====================================================
      TEAM ASSET OVERVIEW
  ===================================================== */}

  <section className="team-assets-section">

    <div className="team-assets-header">

      <div className="team-assets-heading">

        <span className="employee-section-eyebrow">
          ASSET ALLOCATION
        </span>

        <h3>Team Asset Overview</h3>

        <p>
          Review hardware, software, and total asset
          values allocated to team members.
        </p>

      </div>

      <span className="employee-section-count">
        <FiLayers />
        {paginatedSummary.length} Members
      </span>

    </div>


    {/* =====================================================
        ASSET SUMMARY GRID
    ===================================================== */}

    {paginatedSummary.length > 0 ? (

      <div className="team-asset-grid">

        {paginatedSummary.map((emp) => {

          const hardware = emp.hardware || {};
          const software = emp.software || {};

          const totalCost = Number(emp.totalCost) || 0;

          const hardwareCost =
            Number(hardware.totalCost) || 0;

          const softwareCost =
            Number(software.totalCost) || 0;

          return (

            <div
              key={emp._id}
              className="team-asset-card tour-member-info"
            >

              {/* ================= MEMBER HEADER ================= */}

              <div className="team-card-header">

                <div className="team-member-heading">

                  <div className="team-member-avatar">
                    <FiUser />
                  </div>

                  <div className="team-member-details">

                    <h4>
                      {emp.employeeName || "Unnamed Member"}
                    </h4>

                    <span className="team-member-code">
                      {emp.employeeCode || "-"}
                    </span>

                  </div>

                </div>


                <div className="team-department-badge">

                  <FiBriefcase />

                  <span>
                    {emp.department || "No Department"}
                  </span>

                </div>

              </div>


              {/* ================= ASSET SECTIONS ================= */}

              <div className="asset-section">

                {/* HARDWARE */}

                <div className="team-asset-type-card hardware">

                  <div className="team-asset-type-header">

                    <span className="team-asset-type-icon">
                      <FiHardDrive />
                    </span>

                    <h5>Hardware</h5>

                  </div>


                  <div className="team-asset-stats">

                    <div className="team-asset-stat-row">

                      <span>Assets</span>

                      <strong>
                        {hardware.assetCount || 0}
                      </strong>

                    </div>


                    <div className="team-asset-stat-row">

                      <span>Instances</span>

                      <strong>
                        {hardware.instanceCount || 0}
                      </strong>

                    </div>


                    <div className="team-asset-stat-value">

                      <span>Asset Value</span>

                      <strong>
                        {CurrencySymbol}{" "}
                        {hardwareCost.toLocaleString()}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* SOFTWARE */}

                <div className="team-asset-type-card software">

                  <div className="team-asset-type-header">

                    <span className="team-asset-type-icon">
                      <FiMonitor />
                    </span>

                    <h5>Software</h5>

                  </div>


                  <div className="team-asset-stats">

                    <div className="team-asset-stat-row">

                      <span>Assets</span>

                      <strong>
                        {software.assetCount || 0}
                      </strong>

                    </div>


                    <div className="team-asset-stat-row">

                      <span>Instances</span>

                      <strong>
                        {software.instanceCount || 0}
                      </strong>

                    </div>


                    <div className="team-asset-stat-value">

                      <span>Asset Value</span>

                      <strong>
                        {CurrencySymbol}{" "}
                        {softwareCost.toLocaleString()}
                      </strong>

                    </div>

                  </div>

                </div>

              </div>


              {/* ================= TOTAL ASSET VALUE ================= */}

              <div className="total-cost">

                <div className="team-total-label">

                  <FiDollarSign />

                  <span>Total Asset Value</span>

                </div>

                <strong>
                  {CurrencySymbol}{" "}
                  {totalCost.toLocaleString()}
                </strong>

              </div>

            </div>

          );

        })}

      </div>

    ) : (

      <div className="employee-empty-state">

        <FiPackage />

        <h4>No Asset Records Found</h4>

        <p>
          Team asset allocation information
          is not available for the current selection.
        </p>

      </div>

    )}


    {/* ================= SUMMARY PAGINATION ================= */}

    <div className="employee-pagination-wrapper">

      <Pagination
        currentPage={summaryPage}
        totalPages={totalSummaryPages}
        onPageChange={setSummaryPage}
      />

    </div>

  </section>


  {/* =====================================================
      EMPLOYEE MODAL
  ===================================================== */}

  {showModal && (

    <EmployeeModal
      departments={departments}
      employee={editingEmployee}
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
