import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css'; // Shared modern CSS
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
  const perPage = 9; // grid layout works well with 6 per page

  const totalPages = Math.ceil(locations.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = locations.slice(indexOfFirst, indexOfLast);

  // ✅ Fetch all locations
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await getLocations();
      // Reverse to show latest added at top
      setLocations([...data].reverse());
    } catch (err) {
      setError('Error fetching locations');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle new location submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!locationName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Location Name',
        text: 'Please enter a location name before submitting.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    try {
      const newLocation = await createLocation({ name: locationName.trim() });

      // 🆕 Prepend the new location to the top
      setLocations((prev) => [newLocation, ...prev]);
      setLocationName('');
      setCurrentPage(1); // go back to page 1 to show new entry

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
      {/* 🌿 Header Section */}
      <div className="card_header">
        <h3 className="category_title"> Location </h3>
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

      {/* 🌿 Content Section */}
      {loading && <p>Loading locations...</p>}
      {error && <p className="error">{error}</p>}

      <div className="category-grid">
        {currentItems.length === 0 ? (
          <p>No locations available</p>
        ) : (
          <div className="grid">
            {currentItems.map((loc, idx) => (
              <div key={loc._id} className="category-card">
                <div className="category-number">{indexOfFirst + idx + 1}</div>
                <div className="category-name">{loc.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌿 Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages).keys()].map((n) => (
            <button
              key={n}
              className={currentPage === n + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(n + 1)}
            >
              {n + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Location;
