import React, { useState, useEffect } from "react";
import "../Page_styles/Unit.css";
import {
  getUnits,
  createUnit,
  deleteUnit,
  updateUnit,
  restoreUnit
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

const Unit = () => {
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState("search");
  const [showDropdown, setShowDropdown] = useState(false);

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  const [editingUnit, setEditingUnit] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  const capitalize = (v) =>
    v ? v.charAt(0).toUpperCase() + v.slice(1) : v;

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const data = await getUnits();
      setUnits([...data].reverse());
      setApiDone(true);
      setTimeout(() => setLoading(false), 300);
    } catch {
      setLoading(false);
    }
  };

  /* ================= SEARCH ================= */
  const filteredUnits =
    mode === "search"
      ? units.filter((u) =>
          u.name.toLowerCase().includes(inputValue.toLowerCase())
        )
      : units;

  useEffect(() => {
    setCurrentPage(1);
  }, [inputValue, mode]);

  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredUnits.slice(
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
      const res = await createUnit({ name: capitalize(inputValue.trim()) });
      const newUnit = res.data || res;

      setUnits((prev) => [newUnit, ...prev]);
      setInputValue("");

      Swal.fire({
        icon: "success",
        title: "Unit Added",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Unit already exists",
        "error"
      );
    }
  };

  /* ================= DELETE (DEACTIVATE) ================= */
  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: "Deactivate Unit?",
      text: `"${name}" will be deactivated`,
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    await deleteUnit(id);

    setUnits((prev) =>
      prev.map((u) =>
        u._id === id ? { ...u, isActive: false } : u
      )
    );

    Swal.fire("Deactivated", "Unit deactivated", "success");
  };

  /* ================= RESTORE ================= */
  const handleRestore = async (id, name) => {
    const confirm = await Swal.fire({
      title: "Restore Unit?",
      text: `Restore "${name}"?`,
      icon: "question",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    await restoreUnit(id);

    setUnits((prev) =>
      prev.map((u) =>
        u._id === id ? { ...u, isActive: true } : u
      )
    );

    Swal.fire("Restored", "Unit restored successfully", "success");
  };

  /* ================= EDIT ================= */
  const openEditModal = (unit) => {
    setEditingUnit(unit);
    setUpdatedName(unit.name);
  };

  const handleUpdate = async () => {
    if (!updatedName.trim()) {
      Swal.fire("Warning", "Unit name cannot be empty", "warning");
      return;
    }

    await updateUnit(editingUnit._id, {
      name: capitalize(updatedName.trim())
    });

    setUnits((prev) =>
      prev.map((u) =>
        u._id === editingUnit._id
          ? { ...u, name: capitalize(updatedName.trim()) }
          : u
      )
    );

    Swal.fire("Updated", "Unit updated successfully", "success");
    setEditingUnit(null);
  };

  if (loading) return <Loader type="classification" apiDone={apiDone} />;

  return (
    <div className="classification_card">
      <div className="card_header">
        <h3 className="category_title">Unit</h3>

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
            placeholder={mode === "search" ? "Search unit..." : "Add new unit..."}
            value={inputValue}
            onChange={(e) => setInputValue(capitalize(e.target.value))}
          />
        </form>
      </div>

      {/* LIST */}
      <div className="category-grid">
        <div className="grid">
          {currentItems.map((unit, idx) => (
            <div
              key={unit._id}
              className={`category-card ${!unit.isActive ? "inactive-card" : ""}`}
            >
              <div className="category-number">{startIndex + idx + 1}</div>

                           <div className="category-name">
  {cat.name}
</div>

  <span
    className={`status-badge ${
      cat.isActive ? "badge-active" : "badge-inactive"
    }`}
    title={
      cat.isActive
        ? "This category is active"
        : "This category is inactive"
    }
  >
    {cat.isActive ? "Active" : "Inactive"}
  </span>

              <div className="category-actions">
                {unit.isActive ? (
                  <>
                    <button className="btn-edit" onClick={() => openEditModal(unit)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(unit._id, unit.name)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </>
                ) : (
                  <button className="btn-restore" onClick={() => handleRestore(unit._id, unit.name)}>
                    <FontAwesomeIcon icon={faRotateLeft} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {mode === "search" && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* EDIT MODAL */}
      {editingUnit && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Unit</h3>
            <input
              className="edit-input"
              value={updatedName}
              onChange={(e) => setUpdatedName(capitalize(e.target.value))}
            />
            <div className="modal-buttons">
              <button className="save-btn" onClick={handleUpdate}>
                <FontAwesomeIcon icon={faSave} /> Save
              </button>
              <button className="cancel-btn" onClick={() => setEditingUnit(null)}>
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Unit;
