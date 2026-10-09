import React, { useState, useEffect } from "react";
import { createEmployee, updateEmployee } from "../../Services/ApiServices";
import {
  FiEdit3,
  FiUserPlus,
  FiX,
  FiUser,
  FiHash,
  FiBriefcase,
  FiChevronDown,
  FiPhone,
  FiMail,
  FiInfo,
  FiCheck,
  FiPlus,
} from "react-icons/fi";
const AddEmployeeModal = ({ departments, employee, onClose, onSuccess }) => {

  const [form, setForm] = useState({
    name: "",
    employeeCode: "",
    departmentId: "",
    email: "",
    phone: ""
  });

  // 🔥 Prefill form when editing
  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name || "",
        employeeCode: employee.employeeCode || "",
        departmentId: employee.departmentId?._id || employee.departmentId || "",
        email: employee.email || "",
        phone: employee.phone || ""
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (employee) {
        // ✅ Edit Mode
        await updateEmployee(employee._id, form);
      } else {
        // ✅ Create Mode
        await createEmployee(form);
      }

      onSuccess();
      onClose();

    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  return (

<div className="modal-overlay employee-modal-overlay">

  <div
    className="modal employee-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="employee-modal-title"
  >

    {/* ================= MODAL HEADER ================= */}

    <div className="employee-modal-header">

      <div className="employee-modal-header-left">

        <div className="employee-modal-header-icon">
          {employee ? <FiEdit3 /> : <FiUserPlus />}
        </div>

        <div className="employee-modal-header-text">

          <span className="employee-modal-eyebrow">
            TEAM MANAGEMENT
          </span>

          <h3 id="employee-modal-title">
            {employee ? "Edit Team Member" : "Add Team Member"}
          </h3>

          <p>
            {employee
              ? "Update the employee's information and department."
              : "Enter the details to register a new team member."}
          </p>

        </div>

      </div>


      <button
        type="button"
        className="employee-modal-close"
        onClick={onClose}
        aria-label="Close employee modal"
      >
        <FiX />
      </button>

    </div>


    {/* ================= FORM ================= */}

    <form
      className="employee-modal-form"
      onSubmit={handleSubmit}
    >

      <div className="employee-modal-body">

        {/* ================= BASIC INFORMATION ================= */}

        <div className="employee-modal-section">

          <div className="employee-modal-section-header">

            <FiUser />

            <div>
              <h4>Basic Information</h4>
              <p>Employee identity and organizational details</p>
            </div>

          </div>


          <div className="employee-modal-form-grid">

            {/* EMPLOYEE CODE */}

            <div className="employee-modal-field">

              <label htmlFor="employee-code">
                Employee Code
                <span className="employee-required">*</span>
              </label>

              <div className="employee-modal-input-wrapper">

                <FiHash className="employee-modal-input-icon" />

                <input
                  id="employee-code"
                  type="text"
                  name="employeeCode"
                  placeholder="Enter employee code"
                  required
                  value={form.employeeCode}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* EMPLOYEE NAME */}

            <div className="employee-modal-field">

              <label htmlFor="employee-name">
                Employee Name
                <span className="employee-required">*</span>
              </label>

              <div className="employee-modal-input-wrapper">

                <FiUser className="employee-modal-input-icon" />

                <input
                  id="employee-name"
                  type="text"
                  name="name"
                  placeholder="Enter employee name"
                  required
                  value={form.name}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* DEPARTMENT */}

            <div className="employee-modal-field employee-modal-field-full">

              <label htmlFor="employee-department">
                Department
                <span className="employee-required">*</span>
              </label>

              <div className="employee-modal-input-wrapper">

                <FiBriefcase className="employee-modal-input-icon" />

                <select
                  id="employee-department"
                  name="departmentId"
                  required
                  value={form.departmentId}
                  onChange={handleChange}
                >

                  <option value="">
                    Select Department
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

                <FiChevronDown className="employee-modal-select-arrow" />

              </div>

            </div>

          </div>

        </div>


        {/* ================= CONTACT INFORMATION ================= */}

        <div className="employee-modal-section">

          <div className="employee-modal-section-header">

            <FiPhone />

            <div>
              <h4>Contact Information</h4>
              <p>Optional contact details for the team member</p>
            </div>

          </div>


          <div className="employee-modal-form-grid">

            {/* EMAIL */}

            <div className="employee-modal-field">

              <label htmlFor="employee-email">
                Email Address
              </label>

              <div className="employee-modal-input-wrapper">

                <FiMail className="employee-modal-input-icon" />

                <input
                  id="employee-email"
                  type="email"
                  name="email"
                  placeholder="employee@example.com"
                  value={form.email}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* PHONE */}

            <div className="employee-modal-field">

              <label htmlFor="employee-phone">
                Phone Number
              </label>

              <div className="employee-modal-input-wrapper">

                <FiPhone className="employee-modal-input-icon" />

                <input
                  id="employee-phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={handleChange}
                />

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ================= MODAL FOOTER ================= */}

      <div className="modal-buttons employee-modal-footer">

        <div className="employee-modal-footer-note">
          <FiInfo />
          <span>
            Fields marked * are required
          </span>
        </div>


        <div className="employee-modal-footer-actions">

          <button
            type="button"
            onClick={onClose}
            className="btn-cancel employee-modal-cancel"
          >
            Cancel
          </button>


          <button
            type="submit"
            className="btn-save employee-modal-save"
          >

            {employee ? <FiCheck /> : <FiPlus />}

            <span>
              {employee ? "Update Member" : "Save Member"}
            </span>

          </button>

        </div>

      </div>

    </form>

  </div>

</div>

  );
};

export default AddEmployeeModal;