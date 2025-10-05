import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css'; // Shared CSS for consistency
import { getStatuses, createStatus } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const Status = () => {
  const [statusName, setStatusName] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const totalPages = Math.ceil(statuses.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = statuses.slice(indexOfFirst, indexOfLast);

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const data = await getStatuses();
      setStatuses(data);
    } catch (err) {
      setError('Error fetching statuses');
    } finally {
      setLoading(false);
    }
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!statusName) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Status Name',
      text: 'Please enter a status name before submitting.',
      confirmButtonColor: '#3085d6',
    });
    return;
  }

  try {
    await createStatus({ name: statusName });
    setStatusName('');
    fetchStatuses();

    Swal.fire({
      icon: 'success',
      title: 'Status Added',
      text: 'The status has been created successfully!',
      confirmButtonColor: '#3085d6',
      timer: 1800,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error Creating Status',
      text: err.response?.data?.message || 'Something went wrong while creating the status.',
      confirmButtonColor: '#d33',
    });
  }
};


  useEffect(() => {
    fetchStatuses();
  }, []);

  return (
    <div className="classification_card">
      <div className="card_header">
        <h3>Status </h3>
        <form onSubmit={handleSubmit} className="status_form">
          <input
            type="text"
            placeholder="Enter status name"
            value={statusName}
            onChange={(e) => setStatusName(e.target.value)}
          />
          <button type="submit">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </form>
      </div>

      {loading && <p>Loading statuses...</p>}
      {error && <p className="error">{error}</p>}

      <div className="card_content">
        {currentItems.length === 0 ? (
          <p>No statuses available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Status </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((status, idx) => (
                <tr key={status._id}>
                  <td>{indexOfFirst + idx + 1}</td>
                  <td>{status.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

{/* Pagination */}
      <div className="pagination">
        {[...Array(totalPages).keys()].map((n) => (
          <button
            key={n}
            className={currentPage === n + 1 ? "active" : ""}
            onClick={() => setCurrentPage(n + 1)}
          >
            {n + 1}
          </button>
        ))}
      </div>
      </div>
    </div>
  );
};

export default Status;
