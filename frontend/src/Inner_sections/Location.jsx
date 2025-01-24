import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';  // You can use the same CSS
import { getLocations, createLocation } from '../Services/ApiServices';  // Assuming the API services are set up correctly
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const Location = () => {
  const [locationName, setLocationName] = useState('');  // State to store new location name
  const [locations, setLocations] = useState([]);  // State to store fetched locations
  const [loading, setLoading] = useState(false);  // State for loading indicator
  const [error, setError] = useState(null);  // State for error handling

  // Fetch all locations from the backend
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const locationsData = await getLocations();
      setLocations(locationsData);
    } catch (error) {
      setError("Error fetching locations");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission to create a new location
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!locationName) return;  // Prevent submitting if location name is empty

    try {
      await createLocation({ name: locationName });  // Create a new location using the API
      setLocationName('');  // Clear the input field
      fetchLocations();  // Refresh the locations list
    } catch (error) {
      setError("Error creating location");
    }
  };

  // Fetch locations when the component mounts
  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className='classify_content_box'>
      <form className="input" onSubmit={handleFormSubmit}>
        <p>Enter Location: </p>
        <input
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Enter location name"
        />
        <button type="submit" className='add-btn'>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </form>

      {loading && <p>Loading locations...</p>}
      {error && <p className="error">{error}</p>}  {/* Display error if any */}

      <div className="input_content">
        <h3>Locations List</h3>
        {locations.length === 0 ? (
          <p>No locations available</p>  // Show a message if no locations are available
        ) : (
          <table className="unit-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Location Name</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location, index) => (
                <tr key={location._id}>
                  <td>{index + 1}</td>
                  <td>{location.name}</td>  {/* Display the location name */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Location;
