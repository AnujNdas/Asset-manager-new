import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css'; // Shared modern CSS
import { getUnits, createUnit } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

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
    if (!unitName) return;
    try {
      await createUnit({ name: unitName });
      setUnitName('');
      fetchUnits();
    } catch (err) {
      setError('Error creating unit');
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
