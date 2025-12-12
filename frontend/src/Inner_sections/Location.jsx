import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import { getLocations, createLocation, deleteLocation, updateLocation } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faSave, faTimes , faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Pagination from '../Components/Pagination';
import Loader from "../Components/Loader";

const Location = () => {
  const [locationName, setLocationName] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  // Edit Modal State
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
    } catch (err) {
      setError('Error fetching locations');
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = locations.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(locations.length / itemsPerPage);

  // Create Location
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!locationName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Location Name',
        text: 'Please enter a location name.',
      });
      return;
    }

    try {
      const res = await createLocation({ name: locationName.trim() });
      const newLocation = res.location || res.data || res;

      setLocations((prev) => [newLocation, ...prev]);
      setLocationName('');
      setCurrentPage(1);

      Swal.fire({
        icon: 'success',
        title: 'Location Added',
        text: 'The location has been created successfully!',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error Creating Location',
        text: err.response?.data?.message || 'Something went wrong.',
      });
    }
  };

  // Delete
  const handleDelete = async (id, name) => {
    const confirmDelete = await Swal.fire({
      title: "Delete Location?",
      text: `Are you sure you want to delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel"
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await deleteLocation(id);
      setLocations(prev => prev.filter(loc => loc._id !== id));
      Swal.fire("Deleted!", `"${name}" removed successfully.`, "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to delete", "error");
    }
  };

  // Open Edit Modal
  const openEditModal = (location) => {
    setEditingLocation(location);
    setUpdatedName(location.name);
  };

  // Update Location
  const handleUpdate = async () => {
    if (!updatedName.trim()) {
      Swal.fire("Warning", "Location name cannot be empty!", "warning");
      return;
    }

    try {
      await updateLocation(editingLocation._id, { name: updatedName.trim() });

      setLocations(prev =>
        prev.map(loc =>
          loc._id === editingLocation._id ? { ...loc, name: updatedName.trim() } : loc
        )
      );

      Swal.fire("Success", "Location updated successfully!", "success");
      setEditingLocation(null);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update location", "error");
    }
  };

  if (loading) return <Loader type="classification" />;

  return (
    <div className="classification_card">

      <div className="card_header">
        <h3 className="category_title">Location</h3>

        <form onSubmit={handleSubmit} className="category_form">
          <input
            type="text"
            className="category_input"
            placeholder="Add a new location..."
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />
          <button type="submit" className="category_add_btn">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </form>
      </div>

      <div className="category-grid">
        {currentItems.length === 0 ? (
          <p>No locations available</p>
        ) : (
          <div className="grid">
            {currentItems.map((loc, idx) => (
              <div key={loc._id} className="category-card">
                <div className="category-number">{startIndex + idx + 1}</div>
                <div className="category-name">{loc.name}</div>

                <div className="category-actions">
                  
                  {/* EDIT BUTTON */}
                  <button
                    className="btn-edit"
                    onClick={() => openEditModal(loc)}
                  >
                    <FontAwesomeIcon icon={faEdit} /> 
                  </button>

                  {/* DELETE BUTTON */}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* EDIT MODAL */}
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

              <button className="cancel-btn" onClick={() => setEditingLocation(null)}>
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
