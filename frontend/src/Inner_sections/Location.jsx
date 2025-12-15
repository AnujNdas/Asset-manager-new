import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import {
  getLocations,
  createLocation,
  deleteLocation,
  updateLocation
} from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faSave,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Pagination from '../Components/Pagination';
import Loader from "../Components/Loader";

const Location = () => {
  const [inputValue, setInputValue] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  // Edit Modal
  const [editingLocation, setEditingLocation] = useState(null);
  const [updatedName, setUpdatedName] = useState('');

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

  // 🔍 Search using SAME input
  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredLocations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset page while searching
  useEffect(() => {
    setCurrentPage(1);
  }, [inputValue]);

  // ➕ Add Location (same input)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      Swal.fire("Warning", "Please enter a location name", "warning");
      return;
    }

    try {
      const res = await createLocation({ name: inputValue.trim() });
      const newLocation = res.location || res.data || res;

      setLocations(prev => [newLocation, ...prev]);
      setInputValue('');
      setCurrentPage(1);

      Swal.fire({
        icon: 'success',
        title: 'Location Added',
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

  // Delete
  const handleDelete = async (id, name) => {
    const confirmDelete = await Swal.fire({
      title: "Delete Location?",
      text: `Are you sure you want to delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete"
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await deleteLocation(id);
      setLocations(prev => prev.filter(loc => loc._id !== id));
      Swal.fire("Deleted!", `"${name}" removed successfully.`, "success");
    } catch {
      Swal.fire("Error", "Failed to delete location", "error");
    }
  };

  // Edit
  const openEditModal = (location) => {
    setEditingLocation(location);
    setUpdatedName(location.name);
  };

  const handleUpdate = async () => {
    if (!updatedName.trim()) {
      Swal.fire("Warning", "Location name cannot be empty!", "warning");
      return;
    }

    try {
      await updateLocation(editingLocation._id, {
        name: updatedName.trim()
      });

      setLocations(prev =>
        prev.map(loc =>
          loc._id === editingLocation._id
            ? { ...loc, name: updatedName.trim() }
            : loc
        )
      );

      Swal.fire("Success", "Location updated successfully!", "success");
      setEditingLocation(null);
    } catch {
      Swal.fire("Error", "Failed to update location", "error");
    }
  };

  if (loading) {
    return <Loader type="classification" apiDone={apiDone} />;
  }

  return (
    <div className="classification_card">

      <div className="card_header">
        <h3 className="category_title">Location</h3>

        {/* 🔍➕ Unified Search + Add */}
        <form onSubmit={handleSubmit} className="category_form unified-input">
          <input
            type="text"
            className="category_search_input"
            placeholder="Search or add location..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <button type="submit" className="category_add_btn">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </form>
      </div>

      <div className="category-grid">
        {currentItems.length === 0 ? (
          <p>
            {inputValue
              ? "No matching locations found"
              : "No locations available"}
          </p>
        ) : (
          <div className="grid">
            {currentItems.map((loc, idx) => (
              <div key={loc._id} className="category-card">
                <div className="category-number">
                  {startIndex + idx + 1}
                </div>

                <div className="category-name">{loc.name}</div>

                <div className="category-actions">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination disabled while searching */}
      {totalPages > 1 && !inputValue && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Edit Modal */}
      {editingLocation && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Location</h3>

            <input
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              className="edit-input"
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
