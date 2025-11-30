import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import { getStatuses, createStatus } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Pagination from "../Components/Pagination";  // ✅ Reusable Pagination

const Status = () => {
  const [statusName, setStatusName] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 9;
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
        icon: 'warning',
        title: 'Missing Status Name',
        text: 'Please enter a status name.',
      });
      return;
    }

    try {
      await createStatus({ name: statusName });
      setStatusName('');
      setCurrentPage(1); // Always show new item on page 1
      fetchStatuses();

      Swal.fire({
        icon: 'success',
        title: 'Status added!',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error Creating Status',
        text: err.response?.data?.message || 'Something went wrong.',
      });
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

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
