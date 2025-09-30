import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css'; // Shared CSS for all tabs
import { getLocations, createLocation } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const Location = () => {
  const [locationName, setLocationName] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const totalPages = Math.ceil(locations.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = locations.slice(indexOfFirst, indexOfLast);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      setError('Error fetching locations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!locationName) return;
    try {
      await createLocation({ name: locationName });
      setLocationName('');
      fetchLocations();
    } catch (err) {
      setError('Error creating location');
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="classification_card">
      <div className="card_header">
        <h3>Management</h3>
        <form onSubmit={handleSubmit} className="status_form">
          <input
            type="text"
            placeholder="Enter location name"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />
          <button type="submit">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </form>
      </div>

      {loading && <p>Loading locations...</p>}
      {error && <p className="error">{error}</p>}

      <div className="card_content">
        {currentItems.length === 0 ? (
          <p>No locations available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Location Name</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((loc, idx) => (
                <tr key={loc._id}>
                  <td>{indexOfFirst + idx + 1}</td>
                  <td>{loc.name}</td>
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

export default Location;
