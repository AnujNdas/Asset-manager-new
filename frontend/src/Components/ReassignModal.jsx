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
//     <div className="modal-overlay">
//       <div className="modal">

//         <h2>Reassign Asset</h2>

//         {/* DEPARTMENT */}
//         <select
//           value={selectedDepartment}
//             onChange={(e) =>
//               handleDepartmentChange(e.target.value)
//             }
//         >
//           <option value="">
//             Select Department
//           </option>

//           {departments.map((dept) => (
//             <option
//               key={dept._id}
//               value={dept._id}
//             >
//               {dept.name}
//             </option>
//           ))}
//         </select>

//         {/* EMPLOYEE */}
//         <select
//           value={selectedEmployee}
//           onChange={(e) =>
//             setSelectedEmployee(e.target.value)
//           }
//         >
//           <option value="">
//             Select Employee
//           </option>

// {Array.isArray(employees) &&
//   employees.map((emp) => (
//     <option
//       key={emp._id}
//       value={emp._id}
//     >
//       {emp.name}
//     </option>
// ))}
//         </select>

//         {/* LOCATION */}
//         <input
//           type="text"
//           placeholder="Enter location"
//           value={location}
//           onChange={(e) =>
//             setLocation(e.target.value)
//           }
//         />

//         {/* REASSIGNMENT DATE */}
// <div className="input-group">
//   <label>Reassignment Date</label>

//   <input
//     type="date"
//     value={reassignmentDate}
//     onChange={(e) =>
//       setReassignmentDate(e.target.value)
//     }
//   />
// </div>

//         <div className="modal-actions">

//           <button
//             onClick={onClose}
//             className="btn-cancel"
//           >
//             Cancel
//           </button>

//           <button
//             className="btn-save"
//             onClick={handleSubmit}
//           >
//             Confirm
//           </button>

//         </div>
//       </div>
//     </div>

<div
  className="reassign-overlay"
  onClick={onClose}
>
  <div
    className="reassign-modal"
    onClick={(e) => e.stopPropagation()}
  >

    {/* ================= HEADER ================= */}
    <div className="reassign-header">

      <div>
        <span className="reassign-eyebrow">
          ASSET ASSIGNMENT
        </span>

        <h2>Reassign Asset</h2>

        <p>
          Transfer this asset to another employee
          or department.
        </p>
      </div>

      <button
        type="button"
        className="reassign-close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>

    </div>


    {/* ================= BODY ================= */}
    <div className="reassign-body">

      {/* INFORMATION */}
      <div className="reassign-info-box">

        <div className="reassign-info-icon">
          ↗
        </div>

        <div>
          <strong>New Assignment</strong>

          <p>
            Select the department and employee who
            will receive this asset.
          </p>
        </div>

      </div>


      {/* ================= FORM ================= */}
      <div className="reassign-form-grid">

        {/* DEPARTMENT */}
        <div className="reassign-field">

          <label>
            Department
            <span className="reassign-required">
              *
            </span>
          </label>

          <span className="reassign-field-hint">
            Select destination department
          </span>

          <select
            value={selectedDepartment}
            onChange={(e) =>
              handleDepartmentChange(
                e.target.value
              )
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

        </div>


        {/* EMPLOYEE */}
        <div className="reassign-field">

          <label>
            Employee
            <span className="reassign-required">
              *
            </span>
          </label>

          <span className="reassign-field-hint">
            Select employee receiving the asset
          </span>

          <select
            value={selectedEmployee}
            onChange={(e) =>
              setSelectedEmployee(
                e.target.value
              )
            }
            disabled={!selectedDepartment}
          >
            <option value="">
              {selectedDepartment
                ? "Select Employee"
                : "Select Department First"}
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

        </div>


        {/* LOCATION */}
        <div className="reassign-field">

          <label>
            Location
            <span className="reassign-required">
              *
            </span>
          </label>

          <span className="reassign-field-hint">
            Where the asset will be used
          </span>

          <input
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
          />

        </div>


        {/* REASSIGNMENT DATE */}
        <div className="reassign-field">

          <label>
            Reassignment Date
            <span className="reassign-required">
              *
            </span>
          </label>

          <span className="reassign-field-hint">
            Effective transfer date
          </span>

          <input
            type="date"
            value={reassignmentDate}
            onChange={(e) =>
              setReassignmentDate(
                e.target.value
              )
            }
          />

        </div>

      </div>


      {/* ================= NOTICE ================= */}
      <div className="reassign-notice">

        <span className="reassign-notice-dot" />

        <p>
          This reassignment will be recorded in the
          asset lifecycle history.
        </p>

      </div>

    </div>


    {/* ================= FOOTER ================= */}
    <div className="reassign-footer">

      <button
        type="button"
        onClick={onClose}
        className="reassign-cancel-btn"
      >
        Cancel
      </button>

      <button
        type="button"
        className="reassign-confirm-btn"
        onClick={handleSubmit}
      >
        Confirm Reassignment
        <span>→</span>
      </button>

    </div>

  </div>
</div>
  );
};

export default ReassignModal;