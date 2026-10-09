import React from "react";
import {
  FiUsers,
  FiUser,
  FiBriefcase,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
const EmployeeTable = ({ employees, onEdit, onDelete }) => {
  return (

<div className="employee-table">

  {/* =====================================================
      DESKTOP / TABLET TABLE
  ===================================================== */}

  <div className="employee-table-desktop">

    <table>

      <thead>
        <tr>
          <th>Employee Code</th>
          <th>Team Member</th>
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
            <td colSpan={7}>

              <div className="employee-table-empty">
                <FiUsers />
                <h4>No Employees Found</h4>
                <p>
                  No team members match the current selection.
                </p>
              </div>

            </td>
          </tr>

        ) : (

          employees.map((emp) => {

            const status = String(
              emp.status || "active"
            ).toLowerCase();

            const statusLabel =
              status.charAt(0).toUpperCase() +
              status.slice(1).replace(/_/g, " ");

            return (

              <tr key={emp._id}>

                {/* EMPLOYEE CODE */}

                <td>

                  <span className="employee-table-code">
                    {emp.employeeCode || "-"}
                  </span>

                </td>


                {/* EMPLOYEE NAME */}

                <td>

                  <div className="employee-table-member">

                    <span className="employee-table-avatar">
                      <FiUser />
                    </span>

                    <div className="employee-table-member-info">

                      <strong>
                        {emp.name || "Unnamed Employee"}
                      </strong>

                    </div>

                  </div>

                </td>


                {/* DEPARTMENT */}

                <td>

                  <span className="employee-table-department">
                    <FiBriefcase />
                    {emp.departmentId?.name || "-"}
                  </span>

                </td>


                {/* EMAIL */}

                <td>

                  <span className="employee-table-contact">
                    {emp.email || "-"}
                  </span>

                </td>


                {/* PHONE */}

                <td>

                  <span className="employee-table-contact">
                    {emp.phone || "-"}
                  </span>

                </td>


                {/* STATUS */}

                <td>

                  <span
                    className={`employee-table-status ${status}`}
                  >
                    <span className="employee-table-status-dot" />
                    {statusLabel}
                  </span>

                </td>


                {/* ACTIONS */}

                <td>

                  <div className="employee-table-actions">

                    <button
                      type="button"
                      className="edit-btn employee-table-edit"
                      onClick={() => onEdit(emp)}
                      title="Edit employee"
                      aria-label={`Edit ${emp.name || "employee"}`}
                    >
                      <FiEdit2 />
                      <span>Edit</span>
                    </button>


                    <button
                      type="button"
                      className="delete-btn employee-table-delete"
                      onClick={() => onDelete(emp._id)}
                      title="Delete employee"
                      aria-label={`Delete ${emp.name || "employee"}`}
                    >
                      <FiTrash2 />
                      <span>Delete</span>
                    </button>

                  </div>

                </td>

              </tr>

            );

          })

        )}

      </tbody>

    </table>

  </div>


  {/* =====================================================
      MOBILE EMPLOYEE CARDS
  ===================================================== */}

  <div className="employee-table-mobile">

    {employees.length === 0 ? (

      <div className="employee-table-empty">

        <FiUsers />

        <h4>No Employees Found</h4>

        <p>
          No team members match the current selection.
        </p>

      </div>

    ) : (

      employees.map((emp) => {

        const status = String(
          emp.status || "active"
        ).toLowerCase();

        const statusLabel =
          status.charAt(0).toUpperCase() +
          status.slice(1).replace(/_/g, " ");

        return (

          <div
            key={emp._id}
            className="employee-table-mobile-card"
          >

            {/* CARD HEADER */}

            <div className="employee-table-mobile-header">

              <div className="employee-table-member">

                <span className="employee-table-avatar">
                  <FiUser />
                </span>

                <div className="employee-table-member-info">

                  <strong>
                    {emp.name || "Unnamed Employee"}
                  </strong>

                  <span className="employee-table-code">
                    {emp.employeeCode || "-"}
                  </span>

                </div>

              </div>


              <span
                className={`employee-table-status ${status}`}
              >
                <span className="employee-table-status-dot" />
                {statusLabel}
              </span>

            </div>


            {/* CARD DETAILS */}

            <div className="employee-table-mobile-details">

              <div className="employee-table-mobile-field">

                <span>Department</span>

                <strong>
                  {emp.departmentId?.name || "-"}
                </strong>

              </div>


              <div className="employee-table-mobile-field">

                <span>Email</span>

                <strong>
                  {emp.email || "-"}
                </strong>

              </div>


              <div className="employee-table-mobile-field">

                <span>Phone</span>

                <strong>
                  {emp.phone || "-"}
                </strong>

              </div>

            </div>


            {/* CARD ACTIONS */}

            <div className="employee-table-mobile-actions">

              <button
                type="button"
                className="edit-btn employee-table-edit"
                onClick={() => onEdit(emp)}
              >
                <FiEdit2 />
                Edit
              </button>


              <button
                type="button"
                className="delete-btn employee-table-delete"
                onClick={() => onDelete(emp._id)}
              >
                <FiTrash2 />
                Delete
              </button>

            </div>

          </div>

        );

      })

    )}

  </div>

</div>

  );
};

export default EmployeeTable;