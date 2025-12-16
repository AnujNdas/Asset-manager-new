import React, { useState, useEffect } from "react";
import "../Page_styles/Unit.css";
import {
  getLocations,
  createLocation,
  deleteLocation,
  updateLocation,
  restoreLocation
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

const Location = () => {
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState("search"); // search | add
  const [showDropdown, setShowDropdown] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Edit Modal
  const [editingLocation, setEditingLocation] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await getLocations();
      setLocations([...data].reverse());
      setApiDone(true);
      setTimeout(() => setLoading(false), 400);
    } catch {
      setLoading(false);
    }
  };

  // SEARCH FILTER (only active in search mode)
  const filteredLocations =
    mode === "search"
      ? locations.filter(loc =>
          loc.name.toLowerCase().includes(inputValue.toLowerCase())
        )
      : locations;

  useEffect(() => {
    setCurrentPage(1);
  }, [inputValue, mode]);

  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredLocations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ADD / SEARCH HANDLER
  const handleAction = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      Swal.fire("Warning", "Input cannot be empty", "warning");
      return;
    }

    if (mode === "search") return;

    try {
      const res = await createLocation({ name: inputValue.trim() });
      const newLocation = res.location || res.data || res;

      setLocations(prev => [newLocation, ...prev]);
      setInputValue("");

      Swal.fire({
        icon: "success",
        title: "Location Added",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "Location already exists",
        "error"
      );
    }
  };

  // DELETE (SOFT)
  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: "Deactivate Location?",
      text: `Deactivate "${name}"?`,
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    await deleteLocation(id);
    Swal.fire("Deactivated", "Location deactivated", "success");
    fetchLocations();
  };

  // RESTORE
const handleRestore = async (id, name) => {
  const confirm = await Swal.fire({
    title: "Restore Location?",
    text: `Restore "${name}"?`,
    icon: "question",
    showCancelButton: true
  });

  if (!confirm.isConfirmed) return;

  await restoreLocation(id);

  setLocations(prev =>
    prev.map(loc =>
      loc._id === id ? { ...loc, isActive: true } : loc
    )
  );

  Swal.fire("Restored", "Location restored successfully", "success");
};
;

  // EDIT
  const openEditModal = (loc) => {
    setEditingLocation(loc);
    setUpdatedName(loc.name);
  };

  const handleUpdate = async () => {
    if (!updatedName.trim()) {
      Swal.fire("Warning", "Name cannot be empty", "warning");
      return;
    }

    await updateLocation(editingLocation._id, {
      name: updatedName.trim()
    });

    Swal.fire("Updated", "Location updated", "success");
    setEditingLocation(null);
    fetchLocations();
  };

  if (loading) return <Loader type="classification" apiDone={apiDone} />;

  return (
    <div className="classification_card">

      <div className="card_header">
        <h3 className="category_title">Location</h3>

        {/* INPUT WITH MODE DROPDOWN */}
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
                <div
                  onClick={() => {
                    setMode("search");
                    setShowDropdown(false);
                  }}
                >
                  <FontAwesomeIcon icon={faSearch} /> Search
                </div>

                <div
                  onClick={() => {
                    setMode("add");
                    setShowDropdown(false);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} /> Add
                </div>
              </div>
            )}
          </div>

          <input
            type="text"
            className="category_search_input"
            placeholder={
              mode === "search"
                ? "Search location..."
                : "Add new location..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </form>
      </div>

      <div className="category-grid">
        {currentItems.length === 0 ? (
          <p>No locations found</p>
        ) : (
          <div className="grid">
            {currentItems.map((loc, idx) => (
              <div
                key={loc._id}
                className={`category-card ${!loc.isActive ? "inactive" : ""}`}
              >
                <div className="category-number">
                  {startIndex + idx + 1}
                </div>

                <div className="category-name">
                  {loc.name}
                  {!loc.isActive && (
                    <span className="inactive-badge">Inactive</span>
                  )}
                </div>

              <div className="category-actions">
  {loc.isActive ? (
    <>
      <button
        className="btn-edit"
        onClick={() => openEditModal(loc)}
      >
        <FontAwesomeIcon icon={faEdit} />
      </button>

      <button
        className="btn-delete"
        onClick={() => handleDelete(loc._id, loc.name)}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </>
  ) : (
    <button
      className="btn-restore"
      onClick={() => handleRestore(loc._id, loc.name)}
    >
      <FontAwesomeIcon icon={faRotateLeft} />
    </button>
  )}
</div>

              </div>
            ))}
          </div>
        )}
      </div>

      {mode === "search" && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* EDIT / RESTORE MODAL */}
      {editingLocation && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>
              {editingLocation.isActive ? "Edit Location" : "Restore Location"}
            </h3>

            <input
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              className="edit-input"
              disabled={!editingLocation.isActive}
            />

           <div className="modal-buttons">
  <button className="save-btn" onClick={handleUpdate}>
    <FontAwesomeIcon icon={faSave} /> Save
  </button>

  <button
    className="cancel-btn"
    onClick={() => setEditingLocation(null)}
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

export default Location;
