import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';
import { getCategories, createCategory , delete categories } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Pagination from "../Components/Pagination";   // ✅ Using reusable pagination
import Loader from "../Components/Loader";

const Category = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const perPage = 18;

  const totalPages = Math.ceil(categories.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = categories.slice(indexOfFirst, indexOfLast);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories([...data].reverse());
    } catch (err) {
      setError('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  // Handle new category
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!categoryName.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Category Name',
      text: 'Please enter a category name before submitting.',
    });
    return;
  }

  try {
    const res = await createCategory({ name: categoryName.trim() });

    // IMPORTANT FIX: Extract the real category object
    const newCategory = res.category || res.data || res;

    setCategories((prev) => [newCategory, ...prev]);

    setCategoryName('');
    setCurrentPage(1);

    Swal.fire({
      icon: 'success',
      title: 'Category Created',
      text: 'The category has been added successfully!',
    });

  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error Creating Category',
      text: err.response?.data?.message || 'Something went wrong.',
    });
  }
};

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
    Swal.fire("Error", err.response?.data?.message || "Failed to delete", "error");
  }
};

  useEffect(() => {
    fetchCategories();
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
        <h3 className="category_title"> Category</h3>

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

      {/* Loading and Error */}
      {loading && <p>Loading categories...</p>}
      {error && <p className="error">{error}</p>}

      {/* Grid */}
      <div className="category-grid">
        {currentItems.length === 0 ? (
          <p>No categories available</p>
        ) : (
          <div className="grid">
            {currentItems.map((category, idx) => (
              <div key={category._id} className="category-card">
                <div className="category-number">{indexOfFirst + idx + 1}</div>
                <div className="category-name">{category.name}</div>
<button
    className="delete-category-btn"
    onClick={() => handleDelete(category._id, category.name)}
  >
    Delete
  </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Reusable Pagination Component */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default Category;
