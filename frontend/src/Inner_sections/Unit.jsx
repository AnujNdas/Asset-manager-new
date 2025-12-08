import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import { getUnits, createUnit, deleteUnit, updateUnit } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Pagination from "../Components/Pagination"; 
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
      const newUnit = res.unit || res.data || res;

      setUnits((prev) => [newUnit, ...prev]);
      setFilteredUnits((prev) => [newUnit, ...prev]);

      setUnitName('');
      setCurrentPage(1);

      Swal.fire({
        icon: 'success',
        title: 'Unit Added',
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

  // ============================
  // ⭐ EDIT UNIT
  // ============================
  const handleEdit = async (id, oldName) => {
    const { value: newName } = await Swal.fire({
      title: "Edit Unit",
      input: "text",
      inputValue: oldName,
      placeholder: "Enter new unit name",
      showCancelButton: true,
      confirmButtonText: "Update",
    });

    if (!newName || newName.trim() === "") {
      Swal.fire("Error", "Unit name cannot be empty.", "error");
      return;
    }

    try {
      await updateUnit(id, { name: newName.trim() });

      // Update instantly in UI
      setUnits((prev) =>
        prev.map((u) => (u._id === id ? { ...u, name: newName.trim() } : u))
      );

      setFilteredUnits((prev) =>
        prev.map((u) => (u._id === id ? { ...u, name: newName.trim() } : u))
      );

      Swal.fire("Updated!", "Unit updated successfully.", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update", "error");
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

  // Delete
  const handleDelete = async (id, name) => {
    const confirmDelete = await Swal.fire({
      title: "Delete Unit?",
      text: `Are you sure you want to delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel"
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await deleteUnit(id);

      const newList = units.filter((u) => u._id !== id);
      setUnits(newList);
      setFilteredUnits(newList);

      Swal.fire("Deleted!", `"${name}" removed successfully.`, "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to delete", "error");
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="classification_card">
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

      {error ? (
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

                  <div className="card-btn-group">
                    <button
                      className="edit-category-btn"
                      onClick={() => handleEdit(unit._id, unit.name)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-category-btn"
                      onClick={() => handleDelete(unit._id, unit.name)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
