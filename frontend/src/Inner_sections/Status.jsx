import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import { getStatuses, createStatus } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const Status = () => {
  const [statusName, setStatusName] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6; // cards per page

  const totalPages = Math.ceil(statuses.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = statuses.slice(indexOfFirst, indexOfLast);

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const data = await getStatuses();
      setStatuses(data.reverse()); // Newest on top
    } catch (err) {
      setError('Error fetching statuses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!statusName.trim()) return;

    try {
      await createStatus({ name: statusName });
      setStatusName('');
      setCurrentPage(1); // ✅ Go back to page 1 so new item appears on top
      fetchStatuses();
      Swal.fire({
        icon: 'success',
        title: 'Status added!',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      setError('Error creating status');
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  return (
    <div className="category-grid">
      {/* 🌿 Header Section */}
      <div className="card_header">
        <h3 className="category_title">Status </h3>
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

      {/* 🌿 Content */}
      {loading ? (
        <p>Loading statuses...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : statuses.length === 0 ? (
        <p>No statuses available</p>
      ) : (
        <>
          <div className="grid">
            {currentItems.map((status, idx) => (
              <div key={status._id} className="category-card">
                <div className="category-number">
                  {indexOfFirst + idx + 1}
                </div>
                <div className="category-name">{status.name}</div>
              </div>
            ))}
          </div>

          {/* 🌿 Pagination */}
          <div className="pagination">

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={currentPage === i + 1 ? 'active' : ''}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

          </div>
        </>
      )}
    </div>
  );
};

export default Status;
