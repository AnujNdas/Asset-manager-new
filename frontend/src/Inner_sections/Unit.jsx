import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import { getUnits, createUnit } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Pagination from "../Components/Pagination"; // ✅ Unified Pagination
import Loader from "../Components/Loader";
const Unit = () => {
  const [unitName, setUnitName] = useState('');
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 18;
  const totalPages = Math.ceil(filteredUnits.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = filteredUnits.slice(indexOfFirst, indexOfLast);

  // Fetch all units
  const fetchUnits = async () => {
    setLoading(true);
    try {
      const data = await getUnits();
      const reversed = [...data].reverse();
      setUnits(reversed);
      setFilteredUnits(reversed);
    } catch (err) {
      setError('Error fetching units');
    } finally {
      setLoading(false);
    }
  };

  // Add new unit
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!unitName.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Unit Name',
      text: 'Please enter a unit name before submitting.',
    });
    return;
  }

  try {
    const res = await createUnit({ name: unitName.trim() });

    // Extract actual unit object
    const newUnit = res.unit || res.data || res;

    // Update lists instantly without re-fetching
    setUnits((prev) => [newUnit, ...prev]);
    setFilteredUnits((prev) => [newUnit, ...prev]);

    setUnitName('');
    setCurrentPage(1);

    Swal.fire({
      icon: 'success',
      title: 'Unit Added',
      text: 'The unit has been created successfully!',
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error Creating Unit',
      text: err.response?.data?.message || 'Something went wrong.',
    });
  }
};
  // Search filter
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      setFilteredUnits(units);
    } else {
      const filtered = units.filter((u) =>
        u.name.toLowerCase().includes(term)
      );
      setFilteredUnits(filtered);
    }

    setCurrentPage(1);
  };

  useEffect(() => {
    fetchUnits();
  }, []);
    if (loading) {
  return (
      <Loader />
  );
}
  return (
    <div className="classification_card">
      {/* Header */}
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



      {/* Content */}
      {loading ? (
        <p>Loading units...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : filteredUnits.length === 0 ? (
        <p>No units available</p>
      ) : (
        <>
          <div className="category-grid">
            <div className="grid">
            {currentItems.map((unit, idx) => (
              <div key={unit._id} className="category-card">
                <div className="category-number">{indexOfFirst + idx + 1}</div>
                <div className="category-name">{unit.name}</div>
              </div>
            ))}
              </div>
          </div>

          {/* ✅ Reusable Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default Unit;
