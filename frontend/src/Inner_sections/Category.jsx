import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css'; // Shared modern CSS
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
  const perPage = 5;

  const totalPages = Math.ceil(categories.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = categories.slice(indexOfFirst, indexOfLast);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!categoryName) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Category Name',
      text: 'Please enter a category name before submitting.',
      confirmButtonColor: '#3085d6',
    });
    return;
  }

  try {
    await createCategory({ name: categoryName });
    setCategoryName('');
    fetchCategories();

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
        <h3>Category</h3>
        <form onSubmit={handleSubmit} className="status_form">
          <input
            type="text"
            placeholder="Enter category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <button type="submit">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </form>
      </div>

      {loading && <p>Loading categories...</p>}
      {error && <p className="error">{error}</p>}

      <div className="card_content">
        {currentItems.length === 0 ? (
          <p>No categories available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Category </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((category, idx) => (
                <tr key={category._id}>
                  <td>{indexOfFirst + idx + 1}</td>
                  <td>{category.name}</td>
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

export default Category;
