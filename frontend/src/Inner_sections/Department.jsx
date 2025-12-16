import React, { useState, useEffect } from "react";
import "../Page_styles/Unit.css";
import {
  getDepartments,
  createDepartment,
  deleteDepartment,
  updateDepartment,
  restoreDepartment
} from "../Services/ApiServices";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faChevronDown,
  faEdit,
  faSave,
  faTimes,
  faTrash,
  faRotateLeft
} from "@fortawesome/free-solid-svg-icons";

import Swal from "sweetalert2";
import Pagination from "../Components/Pagination";
import Loader from "../Components/Loader";

const Department = () => {
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState("search");
  const [showDropdown, setShowDropdown] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [editingDepartment, setEditingDepartment] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  const capitalize = (v) =>
    v ? v.charAt(0).toUpperCase() + v.slice(1) : v;

  /* ================= FETCH ================= */
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments([...data].reverse());
      setApiDone(true);
      setTimeout(() => setLoading(false), 300);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  /* ================= FILTER ================= */
  const filteredDepartments =
    mode === "search"
      ? departments.filter((d) =>
          d.name.toLowerCase().includes(inputValue.toLowerCase())
        )
      : departments;

  useEffect(() => {
    setCurrentPage(1);
  }, [inputValue, mode]);

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredDepartments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /* ================= ADD ================= */
  const handleAction = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      Swal.fire("Warning", "Input cannot be empty", "warning");
      return;
    }

    if (mode === "search") return;

    try {
      const res = await createDepartment({
        name: capitalize(inputValue.trim())
      });

      const newDepartment = res.data || res;

      setDepartments((prev) => [newDepartment, ...prev]);
      setInputValue("");

      Swal.fire({
        icon: "success",
        title: "Department Added",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "Department already exists",
        "error"
      );
    }
  };

  /* ================= DELETE (DEACTIVATE) ================= */
  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: "Deactivate Department?",
      text: `"${name}" will be deactivated`,
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    await deleteDepartment(id);

    setDepartments((prev) =>
      prev.map((d) =>
        d._id === id ? { ...d, isActive: false } : d
      )
    );

    Swal.fire("Deactivated", "Department deactivated", "success");
  };

  /* ================= RESTORE ================= */
  const handleRestore = async (id, name) => {
    const confirm = await Swal.fire({
      title: "Restore Department?",
      text: `Restore "${name}"?`,
      icon: "question",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    await restoreDepartment(id);

    setDepartments((prev) =>
      prev.map((d) =>
        d._id === id ? { ...d, isActive: true } : d
      )
    );

    Swal.fire("Restored", "Department restored successfully", "success");
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    await updateDepartment(editingDepartment._id, {
      name: capitalize(updatedName.trim())
    });

    setDepartments((prev) =>
      prev.map((d) =>
        d._id === editingDepartment._id
          ? { ...d, name: capitalize(updatedName.trim()) }
          : d
      )
    );

    Swal.fire("Updated", "Department updated", "success");
    setEditingDepartment(null);
  };

  if (loading) {
    return <Loader type="classification" apiDone={apiDone} />;
  }

  return (
    <div className="classification_card">
      <div className="card_header">
        <h3 className="category_title">Department</h3>

        <form onSubmit={handleAction} className="category_form mode-input">
          <div className="mode-selector">
            <button
              type="button"
              className="mode-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <FontAwesomeIcon icon={mode === "search" ? faSearch : faPlus} />
              <FontAwesomeIcon icon={faChevronDown} />
            </button>

            {showDropdown && (
              <div className="mode-dropdown">
                <div onClick={() => { setMode("search"); setShowDropdown(false); }}>
                  <FontAwesomeIcon icon={faSearch} /> Search
                </div>
                <div onClick={() => { setMode("add"); setShowDropdown(false); }}>
                  <FontAwesomeIcon icon={faPlus} /> Add
                </div>
              </div>
            )}
          </div>

          <input
            className="category_search_input"
            placeholder={
              mode === "search"
                ? "Search department..."
                : "Add new department..."
            }
            value={inputValue}
            onChange={(e) =>
              setInputValue(capitalize(e.target.value))
            }
          />
        </form>
      </div>

      {/* LIST */}
      <div className="category-grid">
        <div className="grid">
          {currentItems.map((dep, idx) => (
            <div
              key={dep._id}
              className={`category-card ${!dep.isActive ? "inactive-card" : ""}`}
            >
              <div className="category-number">
                {startIndex + idx + 1}
              </div>

                  <div className="category-name">
  {cat.name}
</div>

  <span
    className={`status-badge ${
      dep.isActive ? "badge-active" : "badge-inactive"
    }`}
    title={
      dep.isActive
        ? "This category is active"
        : "This category is inactive"
    }
  >
    {dep.isActive ? "Active" : "Inactive"}
  </span>

              <div className="category-actions">
                {dep.isActive ? (
                  <>
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
                  </>
                ) : (
                  <button
                    className="btn-restore"
                    onClick={() =>
                      handleRestore(dep._id, dep.name)
                    }
                  >
                    <FontAwesomeIcon icon={faRotateLeft} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PAGINATION */}
      {mode === "search" && totalPages > 1 && (
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
                setUpdatedName(capitalize(e.target.value))
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
