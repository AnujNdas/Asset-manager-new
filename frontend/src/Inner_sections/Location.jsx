import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css'; // Shared CSS for all tabs
import { getLocations, createLocation } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
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

  if (!locationName) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Location Name',
      text: 'Please enter a location name before submitting.',
      confirmButtonColor: '#3085d6',
    });
    return;
  }

  try {
    await createLocation({ name: locationName });
    setLocationName('');
    fetchLocations();

    Swal.fire({
      icon: 'success',
      title: 'Location Added',
      text: 'The location has been created successfully!',
      confirmButtonColor: '#3085d6',
      timer: 1800,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error Creating Location',
      text: err.response?.data?.message || 'Something went wrong while creating the location.',
      confirmButtonColor: '#d33',
    });
  }
};
  

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="classification_card">
      <div className="card_header">
        <h3>Location</h3>
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
                <th>Location </th>
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

export default Location;
