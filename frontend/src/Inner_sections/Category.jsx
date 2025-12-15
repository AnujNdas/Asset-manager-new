import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory
} from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faSave,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Pagination from "../Components/Pagination";
import Loader from "../Components/Loader";

const Category = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔍 Search State
  const [searchTerm, setSearchTerm] = useState('');

  // ✏️ Edit State
  const [editingCategory, setEditingCategory] = useState(null);
  const [updatedName, setUpdatedName] = useState('');

  const perPage = 18;

  // 🔎 Filter categories BEFORE pagination
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = filteredCategories.slice(indexOfFirst, indexOfLast);

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories([...data].reverse());
      setApiDone(true);

      setTimeout(() => {
        setLoading(false);
      }, 400);
    } catch (err) {
      setError('Error fetching categories');
      setLoading(false);
    }
  };

  // Create category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Category Name',
        text: 'Please enter a category name before submitting.'
      });
      return;
    }

    try {
      const res = await createCategory({ name: categoryName.trim() });
      const newCategory = res.category || res.data || res;

      setCategories(prev => [newCategory, ...prev]);
      setCategoryName('');
      setSearchTerm('');
      setCurrentPage(1);

      Swal.fire({
        icon: 'success',
        title: 'Category Created',
        text: 'The category has been added successfully!'
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error Creating Category',
        text: err.response?.data?.error || 'Category already exists.'
      });
    }
  };

  // Delete category
  const handleDelete = async (id, name) => {
    const confirmDelete = await Swal.fire({
      title: "Delete Category?",
      text: `Are you sure you want to delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel"
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat._id !== id));
      Swal.fire("Deleted!", `"${name}" removed successfully.`, "success");
    } catch (err) {
      Swal.fire("Error", "Failed to delete category", "error");
    }
  };

  // Open edit modal
  const openEditModal = (category) => {
    setEditingCategory(category);
    setUpdatedName(category.name);
  };

  // Update category
  const handleUpdate = async () => {
    if (!updatedName.trim()) {
      Swal.fire("Warning", "Category name cannot be empty!", "warning");
      return;
    }

    try {
      await updateCategory(editingCategory._id, {
        name: updatedName.trim()
      });

      setCategories(prev =>
        prev.map(cat =>
          cat._id === editingCategory._id
            ? { ...cat, name: updatedName.trim() }
            : cat
        )
      );

      Swal.fire("Success", "Category updated successfully!", "success");
      setEditingCategory(null);

    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "Category already exists",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return <Loader type="classification" apiDone={apiDone} />;
  }

  return (
    <div className="classification_card">

      <div className="card_header">
        <h3 className="category_title">Category</h3>

        <input
          type="text"
          className="category_search_input"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <form onSubmit={handleSubmit} className="category_form">
          <input
            type="text"
            className="category_input"
            placeholder="Add a new category..."
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <button type="submit" className="category_add_btn">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </form>
      </div>

      <div className="category-grid">
        {currentItems.length === 0 ? (
          <p>
            {searchTerm
              ? "No matching categories found"
              : "No categories available"}
          </p>
        ) : (
          <div className="grid">
            {currentItems.map((category, idx) => (
              <div key={category._id} className="category-card">
                <div className="category-number">
                  {indexOfFirst + idx + 1}
                </div>

                <div className="category-name">
                  {category.name}
                </div>

                <div className="category-actions">
                  <button
                    className="btn-edit"
                    onClick={() => openEditModal(category)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() =>
                      handleDelete(category._id, category.name)
                    }
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !searchTerm && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Category</h3>

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

              <button
                className="cancel-btn"
                onClick={() => setEditingCategory(null)}
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Category;
