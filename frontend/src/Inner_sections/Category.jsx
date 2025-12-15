import React, { useState, useEffect } from "react";
import "../Page_styles/Unit.css";
import {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from "../Services/ApiServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faChevronDown,
  faEdit,
  faSave,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import Pagination from "../Components/Pagination";
import Loader from "../Components/Loader";

const Category = () => {
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState("search"); // search | add
  const [showDropdown, setShowDropdown] = useState(false);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Edit Modal
  const [editingCategory, setEditingCategory] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  // Capitalize helper
  const capitalize = (value) =>
    value
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories([...data].reverse());
      setApiDone(true);
      setTimeout(() => setLoading(false), 400);
    } catch {
      setLoading(false);
    }
  };

  // SEARCH FILTER
  const filteredCategories =
    mode === "search"
      ? categories.filter((cat) =>
          cat.name.toLowerCase().includes(inputValue.toLowerCase())
        )
      : categories;

  useEffect(() => {
    setCurrentPage(1);
  }, [inputValue, mode]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ADD / SEARCH ACTION
  const handleAction = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      Swal.fire("Warning", "Input cannot be empty", "warning");
      return;
    }

    if (mode === "search") return;

    try {
      const res = await createCategory({ name: capitalize(inputValue.trim()) });
      const newCategory = res.category || res.data || res;

      setCategories((prev) => [newCategory, ...prev]);
      setInputValue("");

      Swal.fire({
        icon: "success",
        title: "Category Added",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "Category already exists",
        "error"
      );
    }
  };

  // DELETE
  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: "Delete Category?",
      text: `Delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c._id !== id));
    Swal.fire("Deleted!", "Category removed", "success");
  };

  // EDIT
  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setUpdatedName(cat.name);
  };

  const handleUpdate = async () => {
    await updateCategory(editingCategory._id, {
      name: capitalize(updatedName.trim()),
    });

    setCategories((prev) =>
      prev.map((c) =>
        c._id === editingCategory._id
          ? { ...c, name: capitalize(updatedName.trim()) }
          : c
      )
    );

    Swal.fire("Updated", "Category updated", "success");
    setEditingCategory(null);
  };

  if (loading) return <Loader type="classification" apiDone={apiDone} />;

  return (
    <div className="classification_card">
      <div className="card_header">
        <h3 className="category_title">Category</h3>

        {/* INPUT WITH MODE DROPDOWN (SAME AS LOCATION) */}
        <form onSubmit={handleAction} className="category_form mode-input">
          <div className="mode-selector">
            <button
              type="button"
              className="mode-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <FontAwesomeIcon icon={mode === "search" ? faSearch : faPlus} />
              <FontAwesomeIcon icon={faChevronDown} />
            </button>

            {showDropdown && (
              <div className="mode-dropdown">
                <div
                  onClick={() => {
                    setMode("search");
                    setShowDropdown(false);
                  }}
                >
                  <FontAwesomeIcon icon={faSearch} /> Search
                </div>

                <div
                  onClick={() => {
                    setMode("add");
                    setShowDropdown(false);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} /> Add
                </div>
              </div>
            )}
          </div>

          <input
            type="text"
            className="category_search_input"
            placeholder={
              mode === "search"
                ? "Search category..."
                : "Add new category..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(capitalize(e.target.value))}
          />
        </form>
      </div>

      {/* LIST */}
      <div className="category-grid">
        {currentItems.length === 0 ? (
          <p>No categories found</p>
        ) : (
          <div className="grid">
            {currentItems.map((cat, idx) => (
              <div key={cat._id} className="category-card">
                <div className="category-number">
                  {startIndex + idx + 1}
                </div>
                <div className="category-name">{cat.name}</div>

                <div className="category-actions">
                  <button
                    className="btn-edit"
                    onClick={() => openEditModal(cat)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(cat._id, cat.name)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {mode === "search" && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* EDIT MODAL */}
      {editingCategory && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Category</h3>
            <input
              value={updatedName}
              onChange={(e) =>
                setUpdatedName(capitalize(e.target.value))
              }
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
