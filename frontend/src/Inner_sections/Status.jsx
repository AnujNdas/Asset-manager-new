import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import { 
  getStatuses, 
  createStatus, 
  deleteStatus, 
  updateStatus 
} from '../Services/ApiServices';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTimes, faSave , faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Pagination from "../Components/Pagination";
import Loader from "../Components/Loader";

const Status = () => {

  const [statusName, setStatusName] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 18;
  const totalPages = Math.ceil(statuses.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = statuses.slice(indexOfFirst, indexOfLast);

  // Edit Modal State
  const [editingStatus, setEditingStatus] = useState(null);
  const [updatedName, setUpdatedName] = useState('');

  // Fetch all statuses
  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const data = await getStatuses();
      setStatuses([...data].reverse());
    } catch (err) {
      setError('Error fetching statuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // Add status
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!statusName.trim()) {
      Swal.fire("Warning", "Status name cannot be empty!", "warning");
      return;
    }

    try {
      const res = await createStatus({ name: statusName.trim() });
      const newStatus = res.status || res.data || res;

      setStatuses(prev => [newStatus, ...prev]);
      setStatusName('');
      setCurrentPage(1);

      Swal.fire("Success", "Status added successfully!", "success");

    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to create status", "error");
    }
  };

  // Open Edit Modal
  const openEditModal = (status) => {
    setEditingStatus(status);
    setUpdatedName(status.name);
  };

  // Save Edited Status
  const handleUpdate = async () => {
    if (!updatedName.trim()) {
      Swal.fire("Warning", "Status name cannot be empty!", "warning");
      return;
    }

    try {
      await updateStatus(editingStatus._id, { name: updatedName.trim() });

      setStatuses(prev =>
        prev.map(st =>
          st._id === editingStatus._id ? { ...st, name: updatedName.trim() } : st
        )
      );

      Swal.fire("Success", "Status updated successfully!", "success");
      setEditingStatus(null);

    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Update failed", "error");
    }
  };

  // Delete Status
  const handleDelete = async (id, name) => {
    const confirmDelete = await Swal.fire({
      title: "Delete Status?",
      text: `Are you sure you want to delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await deleteStatus(id);
      setStatuses(prev => prev.filter(st => st._id !== id));

      Swal.fire("Deleted!", `"${name}" has been removed.`, "success");

    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to delete status", "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="classification_card">
      
      <div className="card_header">
        <h3 className="category_title">Status</h3>

        <form onSubmit={handleSubmit} className="category_form">
          <input
            type="text"
            placeholder="Enter status name"
            value={statusName}
            onChange={(e) => setStatusName(e.target.value)}
            className="category_input"
          />
          <button type="submit" className="category_add_btn">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </form>
      </div>

      {error ? (
        <p className="error">{error}</p>
      ) : statuses.length === 0 ? (
        <p>No statuses available</p>
      ) : (
        <>
          <div className="category-grid">
            <div className="grid">
              {currentItems.map((status, idx) => (
                <div key={status._id} className="category-card">
                  <div className="category-number">{indexOfFirst + idx + 1}</div>
                  <div className="category-name">{status.name}</div>

                  <div className="category-actions">
                    <button
                      className="btn-edit"
                      onClick={() => openEditModal(status)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(status._id, status.name)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* EDIT MODAL — Same as Category */}
      {editingStatus && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Status</h3>

            <input
              type="text"
              className="edit-input"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
            />

            <div className="modal-buttons">
              <button className="save-btn" onClick={handleUpdate}>
                <FontAwesomeIcon icon={faSave} /> Save
              </button>

              <button className="cancel-btn" onClick={() => setEditingStatus(null)}>
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Status;
