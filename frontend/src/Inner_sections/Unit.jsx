import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import { getUnits, createUnit } from '../Services/ApiServices';  // Make sure to import these functions from api.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPlus} from '@fortawesome/free-solid-svg-icons'

const Unit = () => {
  const [unitName, setUnitName] = useState('');  // State to store the new unit name
  const [units, setUnits] = useState([]);  // State to store all fetched units
  const [loading, setLoading] = useState(false);  // State for loading indicator
  const [error, setError] = useState(null);  // State for error handling

  // Fetch all units from the backend
  const fetchUnits = async () => {
    setLoading(true);
    try {
      const unitsData = await getUnits();
      setUnits(unitsData);
    } catch (error) {
      setError("Error fetching units");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission to create a new unit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!unitName) return;  // Prevent submitting if unit name is empty

    try {
      await createUnit({ name: unitName });  // Create a new unit using the API
      setUnitName('');  // Clear the input field
      fetchUnits();  // Refresh the units list
    } catch (error) {
      setError("Error creating unit");
    }
  };

  // Fetch units when the component mounts
  useEffect(() => {
    fetchUnits();
  }, []);

  return (
    <div className='classify_content_box'>
    <form className="input" onSubmit={handleFormSubmit}>
      <p> Enter Unit: </p>
      <input 
        type="text" 
        value={unitName} 
        onChange={(e) => setUnitName(e.target.value)} 
        placeholder="Enter unit name" 
      />
      <button type="submit" className='add-btn'><FontAwesomeIcon icon={faPlus} /></button>
    </form>

    {loading && <p>Loading units...</p>}
    {error && <p className="error">{error}</p>}  {/* Display error if any */}

    <div className="input_content">
      <h3>Units List</h3>
      {units.length === 0 ? (
        <p>No units available</p>  // Show a message if no units are available
      ) : (
        <table className="unit-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Unit Name</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit, index) => (
              <tr key={unit._id}>
                <td>{index + 1}</td>
                <td>{unit.name}</td>  {/* Display the unit name */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);
};
export default Unit;

