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
  const [classifyCurrentPage, setClassifyCurrentPage] = useState(1);
  const classifyPerPage = 10;
  
  // Your classification data array
  const classificationData = units; // Replace with your actual array
  
  // Calculate number of pages
  const totalClassifyPages = Math.ceil(classificationData.length / classifyPerPage);
  
  // Paginate function for classification
  const paginateClassify = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalClassifyPages) {
      setClassifyCurrentPage(pageNumber);
    }
  };
  
  // Get current items for this page
  const indexOfLastItem = classifyCurrentPage * classifyPerPage;
  const indexOfFirstItem = indexOfLastItem - classifyPerPage;
  const currentClassifyItems = classificationData.slice(indexOfFirstItem, indexOfLastItem);
  
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
      {currentClassifyItems.length === 0 ? (
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
            {currentClassifyItems.map((unit, index) => (
              <tr key={unit._id}>
                <td data-label="S.No">{index + 1}</td>
                <td data-label="Name">{unit.name}</td>  {/* Display the unit name */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="pages">
  <button
    onClick={() => paginateClassify(classifyCurrentPage - 1)}
    disabled={classifyCurrentPage === 1}
    className={`pagination ${classifyCurrentPage === 1 ? 'disabled' : ''}`}
  >
    Previous
  </button>

  {Array.from({ length: totalClassifyPages }, (_, index) => (
    <button
      key={index + 1}
      onClick={() => paginateClassify(index + 1)}
      className={`pagination ${classifyCurrentPage === index + 1 ? 'active' : ''}`}
      style={{ padding: "5px" }}
    >
      {index + 1}
    </button>
  ))}

  <button
    onClick={() => paginateClassify(classifyCurrentPage + 1)}
    disabled={classifyCurrentPage === totalClassifyPages}
    className={`pagination ${classifyCurrentPage === totalClassifyPages ? 'disabled' : ''}`}
  >
    Next
  </button>
</div>
    </div>
  </div>
);
};
export default Unit;

