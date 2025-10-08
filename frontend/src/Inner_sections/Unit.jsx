import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import { getUnits, createUnit } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const Unit = () => {
  const [unitName, setUnitName] = useState('');
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 9;
  const totalPages = Math.ceil(filteredUnits.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = filteredUnits.slice(indexOfFirst, indexOfLast);

  // ✅ Fetch units
  const fetchUnits = async () => {
    setLoading(true);
    try {
      const data = await getUnits();
      const reversed = [...data].reverse(); // newest first
      setUnits(reversed);
      setFilteredUnits(reversed);
    } catch (err) {
      setError('Error fetching units');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new unit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!unitName.trim()) {
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
      setCurrentPage(1); // ✅ Go back to first page to show new item
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
        text: err.response?.data?.message || 'Something went wrong.',
        confirmButtonColor: '#d33',
      });
    }
  };

  // ✅ Search filter
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === '') {
      setFilteredUnits(units);
    } else {
      const filtered = units.filter((u) => u.name.toLowerCase().includes(term));
      setFilteredUnits(filtered);
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  return (
    <div className="category-grid">
      {/* 🌿 Header */}
      <div className="card_header">
        <h3 className="category_title">Unit</h3>

        <form onSubmit={handleSubmit} className="category_form">
          <input
            type="text"
            placeholder="Enter unit name"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            className="category_input"
          />
          <button type="submit" className="category_add_btn">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </form>
      </div>

  

      {/* 🌿 Content */}
      {loading ? (
        <p>Loading units...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : filteredUnits.length === 0 ? (
        <p>No units available</p>
      ) : (
        <>
          <div className="grid">
            {currentItems.map((unit, idx) => (
              <div key={unit._id} className="category-card">
                <div className="category-number">
                  {indexOfFirst + idx + 1}
                </div>
                <div className="category-name">{unit.name}</div>
              </div>
            ))}
          </div>

          {/* 🌿 Pagination */}
          {totalPages > 1 && (
            <div className="pagination">

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={currentPage === i + 1 ? 'active' : ''}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Unit;
