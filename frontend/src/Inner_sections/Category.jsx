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
// Example state for classification pagination
const [classifyCurrentPage, setClassifyCurrentPage] = useState(1);
const classifyPerPage = 5;

// Your classification data array
const classificationData = categories; // Replace with your actual array

// Calculate number of pages
const totalClassifyPages = Math.ceil(classificationData.length / classifyPerPage);

// Paginate function for classification
const paginateClassify = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalClassifyPages) {
    setClassifyCurrentPage(pageNumber);
  }
};

// Get current items for this page
const indexOfLastItem = classifyCurrentPage * classifyPerPage;
const indexOfFirstItem = indexOfLastItem - classifyPerPage;
const currentClassifyItems = classificationData.slice(indexOfFirstItem, indexOfLastItem);


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
        {currentClassifyItems.length === 0 ? (
          <p>No categories available</p>  // Show a message if no categories are available
        ) : (
          <table className="status-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category Name</th>
              </tr>
            </thead>
            <tbody>
              {currentClassifyItems.map((category, index) => (
                <tr key={category._id}>
                  <td data-label="S.No">{indexOfFirstItem + index + 1}</td>
                  <td data-label="Name">{category.name}</td>  {/* Display the category name */}
                </tr>
              ))}
            </tbody>
          </table>
        )}

<div className="pages">
  <button
    onClick={() => paginateClassify(classifyCurrentPage - 1)}
    disabled={classifyCurrentPage === 1}
    className={`pagination ${classifyCurrentPage === 1 ? 'disabled' : ''}`}
  >
    Prev
  </button>

  {Array.from({ length: totalClassifyPages }, (_, index) => (
    <button
      key={index + 1}
      onClick={() => paginateClassify(index + 1)}
      className={`pagination ${classifyCurrentPage === index + 1 ? 'active' : ''}`}
      style={{ padding: "5px" }}
    >
      {index + 1}
    </button>
  ))}

  <button
    onClick={() => paginateClassify(classifyCurrentPage + 1)}
    disabled={classifyCurrentPage === totalClassifyPages}
    className={`pagination ${classifyCurrentPage === totalClassifyPages ? 'disabled' : ''}`}
  >
    Next
  </button>
</div>

      </div>
    </div>
  );
};

export default Category;


