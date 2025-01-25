import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';  // Make sure to style this page
import { getStatuses, createStatus } from '../Services/ApiServices';  // Import these functions from api.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const Status = () => {
  const [statusName, setStatusName] = useState('');  // State to store the new status name
  const [statuses, setStatuses] = useState([]);  // State to store all fetched statuses
  const [loading, setLoading] = useState(false);  // State for loading indicator
  const [error, setError] = useState(null);  // State for error handling

  // Fetch all statuses from the backend
  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const statusesData = await getStatuses();
      setStatuses(statusesData);
    } catch (error) {
      setError('Error fetching statuses');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission to create a new status
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!statusName) return;  // Prevent submitting if status name is empty

    try {
      await createStatus({ name: statusName });  // Create a new status using the API
      setStatusName('');  // Clear the input field
      fetchStatuses();  // Refresh the statuses list
    } catch (error) {
      setError('Error creating status');
    }
  };

  // Fetch statuses when the component mounts
  useEffect(() => {
    fetchStatuses();
  }, []);

  return (
    <div className='classify_content_box'>
      <form className="input" onSubmit={handleFormSubmit}>
        <p> Enter Status: </p>
        <input
          type="text"
          value={statusName}
          onChange={(e) => setStatusName(e.target.value)}
          placeholder="Enter status name"
        />
        <button type="submit" className='add-btn'>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </form>

      {loading && <p>Loading statuses...</p>}
      {error && <p className="error">{error}</p>}  {/* Display error if any */}

      <div className="input_content">
        <h3>Status List</h3>
        {statuses.length === 0 ? (
          <p>No statuses available</p>  // Show a message if no statuses are available
        ) : (
          <table className="status-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Status Name</th>
              </tr>
            </thead>
            <tbody>
              {statuses.map((status, index) => (
                <tr key={status._id}>
                  <td>{index + 1}</td>
                  <td>{status.name}</td>  {/* Display the status name */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Status;

