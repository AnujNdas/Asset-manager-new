import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css'; // Shared CSS for consistency
import { getStatuses, createStatus } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

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
    if (!statusName) return;
    try {
      await createStatus({ name: statusName });
      setStatusName('');
      fetchStatuses();
    } catch (err) {
      setError('Error creating status');
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

        <div className="pagination_container">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Status;
