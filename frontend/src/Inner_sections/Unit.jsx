import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css'; // Shared modern CSS
import { getUnits, createUnit } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const Unit = () => {
  const [unitName, setUnitName] = useState('');
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const totalPages = Math.ceil(units.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = units.slice(indexOfFirst, indexOfLast);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const data = await getUnits();
      setUnits(data);
    } catch (err) {
      setError('Error fetching units');
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!unitName) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Unit Name',
      text: 'Please enter a unit name before submitting.',
      confirmButtonColor: '#3085d6',
    });
    return;
  }

  try {
    await createUnit({ name: unitName });
    setUnitName('');
    fetchUnits();

    Swal.fire({
      icon: 'success',
      title: 'Unit Added',
      text: 'The unit has been created successfully!',
      confirmButtonColor: '#3085d6',
      timer: 1800,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error Creating Unit',
      text: err.response?.data?.message || 'Something went wrong while creating the unit.',
      confirmButtonColor: '#d33',
    });
  }
};

  useEffect(() => {
    fetchUnits();
  }, []);

  return (
    <div className="classification_card">
      <div className="card_header">
        <h3>Unit </h3>
        <form onSubmit={handleSubmit} className="status_form">
          <input
            type="text"
            placeholder="Enter unit name"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
          />
          <button type="submit">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </form>
      </div>

      {loading && <p>Loading units...</p>}
      {error && <p className="error">{error}</p>}

      <div className="card_content">
        {currentItems.length === 0 ? (
          <p>No units available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Unit </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((unit, idx) => (
                <tr key={unit._id}>
                  <td>{indexOfFirst + idx + 1}</td>
                  <td>{unit.name}</td>
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

export default Unit;
