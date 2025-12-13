import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import { getUnits, createUnit, deleteUnit, updateUnit } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faSave, faTimes , faTrash} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Pagination from "../Components/Pagination"; 
import Loader from "../Components/Loader";

const Unit = () => {
  const [unitName, setUnitName] = useState('');
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 18;

  // Edit Modal State
  const [editingUnit, setEditingUnit] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

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
      setApiDone(true)
      // ✅ allow progress to hit 100%
    setTimeout(() => {
      setLoading(false);
    }, 400);
    } catch (err) {
      setError('Error fetching units');
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
        text: 'Please enter a unit name.',
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
        timer: 1200,
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

  // Open Edit Modal
  const openEditModal = (unit) => {
    setEditingUnit(unit);
    setUpdatedName(unit.name);
  };

  // Update Unit
  const handleUpdate = async () => {
    if (!updatedName.trim()) {
      Swal.fire("Warning", "Unit name cannot be empty!", "warning");
      return;
    }

    try {
      await updateUnit(editingUnit._id, { name: updatedName.trim() });

      setUnits((prev) =>
        prev.map((u) =>
          u._id === editingUnit._id ? { ...u, name: updatedName.trim() } : u
        )
      );

      setFilteredUnits((prev) =>
        prev.map((u) =>
          u._id === editingUnit._id ? { ...u, name: updatedName.trim() } : u
        )
      );

      Swal.fire("Success", "Unit updated successfully!", "success");
      setEditingUnit(null);

    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update", "error");
    }
  };

  // Search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      setFilteredUnits(units);
    } else {
      setFilteredUnits(
        units.filter((u) =>
          u.name.toLowerCase().includes(term)
        )
      );
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

  if (loading) return <Loader type="classification" apiDone={apiDone} />;

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

                  <div className="category-actions">

                    <button
                      className="btn-edit"
                      onClick={() => openEditModal(unit)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(unit._id, unit.name)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
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

      {/* ⭐ EDIT MODAL */}
      {editingUnit && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Unit</h3>

            <input
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              className="edit-input"
            />

            <div className="modal-buttons">
              <button className="save-btn" onClick={handleUpdate}>
                <FontAwesomeIcon icon={faSave} /> Save
              </button>

              <button className="cancel-btn" onClick={() => setEditingUnit(null)}>
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Unit;
