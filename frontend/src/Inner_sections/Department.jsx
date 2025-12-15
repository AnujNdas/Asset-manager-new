import React, { useState, useEffect } from "react";
import "../Page_styles/Unit.css";
import {
  getDepartments,
  createDepartment,
  deleteDepartment,
  updateDepartment
} from "../Services/ApiServices";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faEdit,
  faSave,
  faTimes,
  faTrash,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";

import Swal from "sweetalert2";
import Pagination from "../Components/Pagination";
import Loader from "../Components/Loader";

const Department = () => {
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState("search"); // search | add
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;

  // Edit
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  // Capitalize first letter (UI only – backend enforces final format)
  const formatValue = (value) =>
    value
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value;

  /* ============================
     Fetch Departments
  ============================ */
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments([...data].reverse());
      setApiDone(true);
      setTimeout(() => setLoading(false), 400);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  /* ============================
     Search Filter
  ============================ */
  const filteredDepartments =
    mode === "search"
      ? departments.filter((d) =>
          d.name.toLowerCase().includes(inputValue.toLowerCase())
        )
      : departments;

  useEffect(() => {
    setCurrentPage(1);
  }, [inputValue, mode]);

  const totalPages = Math.ceil(filteredDepartments.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = filteredDepartments.slice(
    indexOfFirst,
    indexOfLast
  );

  /* ============================
     Add Department
  ============================ */
  const handleAdd = async () => {
    if (!inputValue.trim()) {
      Swal.fire("Warning", "Department name cannot be empty", "warning");
      return;
    }

    try {
      const res = await createDepartment({ name: inputValue.trim() });
      const newDepartment = res.data || res;

      setDepartments((prev) => [newDepartment, ...prev]);
      setInputValue("");
      setMode("search");

      Swal.fire("Success", "Department added successfully!", "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Department already exists",
        "error"
      );
    }
  };

  /* ============================
     Delete Department
  ============================ */
  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: "Delete Department?",
      text: `Delete "${name}"?`,
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    await deleteDepartment(id);
    setDepartments((prev) => prev.filter((d) => d._id !== id));

    Swal.fire("Deleted", "Department removed", "success");
  };

  /* ============================
     Update Department
  ============================ */
  const handleUpdate = async () => {
    if (!updatedName.trim()) return;

    await updateDepartment(editingDepartment._id, {
      name: updatedName.trim()
    });

    setDepartments((prev) =>
      prev.map((d) =>
        d._id === editingDepartment._id
          ? { ...d, name: updatedName.trim() }
          : d
      )
    );

    setEditingDepartment(null);
    Swal.fire("Success", "Department updated", "success");
  };

  if (loading) {
    return <Loader type="classification" apiDone={apiDone} />;
  }

  return (
    <div className="classification_card">
      <div className="card_header">
        <h3 className="category_title">Department</h3>

        {/* 🔍➕ Unified Search / Add Input */}
        <div className="unified-input-wrapper">
          <input
            type="text"
            className="category_search_input"
            placeholder={
              mode === "search"
                ? "Search departments..."
                : "Add new department..."
            }
            value={inputValue}
            onChange={(e) =>
              setInputValue(formatValue(e.target.value))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && mode === "add") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />

          {/* MODE SELECTOR */}
          <button
            type="button"
            className="mode-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FontAwesomeIcon
              icon={mode === "search" ? faSearch : faPlus}
            />
            <FontAwesomeIcon icon={faChevronDown} />
          </button>

          {dropdownOpen && (
            <div className="mode-dropdown">
              <div
                onClick={() => {
                  setMode("search");
                  setDropdownOpen(false);
                }}
              >
                <FontAwesomeIcon icon={faSearch} /> Search
              </div>

              <div
                onClick={() => {
                  setMode("add");
                  setDropdownOpen(false);
                }}
              >
                <FontAwesomeIcon icon={faPlus} /> Add
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="category-grid">
        {currentItems.length === 0 ? (
          <p>No departments found</p>
        ) : (
          <div className="grid">
            {currentItems.map((dep, idx) => (
              <div key={dep._id} className="category-card">
                <div className="category-number">
                  {indexOfFirst + idx + 1}
                </div>

                <div className="category-name">{dep.name}</div>

                <div className="category-actions">
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setEditingDepartment(dep);
                      setUpdatedName(dep.name);
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() =>
                      handleDelete(dep._id, dep.name)
                    }
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && mode === "search" && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* EDIT MODAL */}
      {editingDepartment && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Department</h3>

            <input
              className="edit-input"
              value={updatedName}
              onChange={(e) =>
                setUpdatedName(formatValue(e.target.value))
              }
            />

            <div className="modal-buttons">
              <button className="save-btn" onClick={handleUpdate}>
                <FontAwesomeIcon icon={faSave} /> Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditingDepartment(null)}
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Department;
