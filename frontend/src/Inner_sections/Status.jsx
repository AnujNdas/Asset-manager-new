import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import { getStatuses, createStatus , deleteStatus , updateStatus} from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Pagination from "../Components/Pagination";  // ✅ Reusable Pagination
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

  // Fetch all statuses
  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const data = await getStatuses();
      setStatuses([...data].reverse()); // Show newest first
    } catch (err) {
      setError('Error fetching statuses');
    } finally {
      setLoading(false);
    }
  };

  // Add new status
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!statusName.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Missing Status Name",
      text: "Please enter a status name.",
    });
    return;
  }

  try {
    const res = await createStatus({ name: statusName.trim() });

    // FIX: extract correct status object
    const newStatus = res.status || res.data || res;

    setStatuses((prev) => [newStatus, ...prev]);  // instant update
    setStatusName("");
    setCurrentPage(1);

    Swal.fire({
      icon: "success",
      title: "Status added!",
      timer: 1200,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error Creating Status",
      text: err.response?.data?.message || "Something went wrong.",
    });
  }
};
  const handleEdit = async (id, oldName) => {
  const { value: newName } = await Swal.fire({
    title: "Edit Status",
    input: "text",
    inputValue: oldName,
    placeholder: "Enter new status name",
    showCancelButton: true,
    confirmButtonText: "Update",
  });

  if (!newName || newName.trim() === "") {
    Swal.fire("Error", "Status name cannot be empty.", "error");
    return;
  }

  try {
    const updated = await updateStatus(id, { name: newName.trim() });

    // Update UI instantly
    setStatuses(prev =>
      prev.map(st => st._id === id ? { ...st, name: newName.trim() } : st)
    );

    Swal.fire("Updated!", "Status updated successfully.", "success");
  } catch (err) {
    Swal.fire("Error", err.response?.data?.message || "Failed to update", "error");
  }
};

const handleDelete = async (id, name) => {
  const confirmDelete = await Swal.fire({
    title: "Delete Category?",
    text: `Are you sure you want to delete "${name}"?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel"
  });

  if (!confirmDelete.isConfirmed) return;

  try {
    await deleteStatus(id);
    setStatuses(prev => prev.filter(cat => cat._id !== id));
    Swal.fire("Deleted!", `"${name}" removed successfully.`, "success");
  } catch (err) {
    Swal.fire("Error", err.response?.data?.message || "Failed to delete", "error");
  }
};

  useEffect(() => {
    fetchStatuses();
  }, []);
    if (loading) {
  return (
      <Loader />
  );
}
  return (
    <div className="classification_card">
      {/* Header */}
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

      {/* Content */}
      {loading ? (
        <p>Loading statuses...</p>
      ) : error ? (
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
                    className="edit-category-btn"
                    onClick={() => openEditModal(category)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>

    <button
      className="delete-category-btn"
      onClick={() => handleDelete(status._id, status.name)}
    >
      Delete
    </button>
  </div>
              </div>
            ))}
              </div>
          </div>

          {/* ✅ Unified Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default Status;
