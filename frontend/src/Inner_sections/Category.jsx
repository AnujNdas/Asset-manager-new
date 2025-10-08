import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css'; // You can keep using this for shared styles
import { getCategories, createCategory } from '../Services/ApiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const Category = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8; // works better with grid layout

  const totalPages = Math.ceil(categories.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = categories.slice(indexOfFirst, indexOfLast);

  // ✅ Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      // Sort categories by creation date (if available) or just reverse to show latest first
      const sorted = [...data].reverse();
      setCategories(sorted);
    } catch (err) {
      setError('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Category Name',
        text: 'Please enter a category name before submitting.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    try {
      const newCategory = await createCategory({ name: categoryName.trim() });

      // 🆕 Prepend the newly created category to the list
      setCategories((prev) => [newCategory, ...prev]);
      setCategoryName('');
      setCurrentPage(1); // Always jump back to page 1 to show new entry

      Swal.fire({
        icon: 'success',
        title: 'Category Created',
        text: 'The category has been added successfully!',
        confirmButtonColor: '#3085d6',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error Creating Category',
        text: err.response?.data?.message || 'Something went wrong while creating the category.',
        confirmButtonColor: '#d33',
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="classification_card">
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


      {loading && <p>Loading categories...</p>}
      {error && <p className="error">{error}</p>}

      {/* 🌿 Grid Card Layout */}
      <div className="category-grid">
        {currentItems.length === 0 ? (
          <p>No categories available</p>
        ) : (
          <div className="grid">
            {currentItems.map((category, idx) => (
              <div key={category._id} className="category-card">
                <div className="category-number">{indexOfFirst + idx + 1}</div>
                <div className="category-name">{category.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages).keys()].map((n) => (
            <button
              key={n}
              className={currentPage === n + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(n + 1)}
            >
              {n + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;
