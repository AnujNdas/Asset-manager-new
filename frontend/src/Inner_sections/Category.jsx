import React, { useState, useEffect } from 'react';
import '../Page_styles/Unit.css';  // You can use the same CSS
import { getCategories, createCategory } from '../Services/ApiServices';  // Assuming the API services are set up correctly
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const Category = () => {
  const [categoryName, setCategoryName] = useState('');  // State to store new category name
  const [categories, setCategories] = useState([]);  // State to store fetched categories
  const [loading, setLoading] = useState(false);  // State for loading indicator
  const [error, setError] = useState(null);  // State for error handling

  // Fetch all categories from the backend
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      setError("Error fetching categories");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission to create a new category
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName) return;  // Prevent submitting if category name is empty

    try {
      await createCategory({ name: categoryName });  // Create a new category using the API
      setCategoryName('');  // Clear the input field
      fetchCategories();  // Refresh the categories list
    } catch (error) {
      setError("Error creating category");
    }
  };

  // Fetch categories when the component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className='classify_content_box'>
      <form className="input" onSubmit={handleFormSubmit}>
        <p>Enter Category: </p>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter category name"
        />
        <button type="submit" className='add-btn'>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </form>

      {loading && <p>Loading categories...</p>}
      {error && <p className="error">{error}</p>}  {/* Display error if any */}

      <div className="input_content">
        <h3>Categories List</h3>
        {categories.length === 0 ? (
          <p>No categories available</p>  // Show a message if no categories are available
        ) : (
          <table className="unit-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category Name</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category._id}>
                  <td>{index + 1}</td>
                  <td>{category.name}</td>  {/* Display the category name */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Category;


