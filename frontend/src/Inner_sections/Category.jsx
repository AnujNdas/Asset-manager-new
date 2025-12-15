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
  faEdit,
  faSave,
  faTimes,
  faTrash,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import Pagination from "../Components/Pagination";
import Loader from "../Components/Loader";

const Category = () => {
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState("search"); // search | add
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Edit
  const [editingCategory, setEditingCategory] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  const perPage = 12;

  // Capitalize first letter (frontend cosmetic)
  const formatValue = (value) =>
    value
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value;

  // Filter (only when in search mode)
  const filteredCategories =
    mode === "search"
      ? categories.filter((cat) =>
          cat.name.toLowerCase().includes(inputValue.toLowerCase())
        )
      : categories;

  const totalPages = Math.ceil(filteredCategories.length / perPage);
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentItems = filteredCategories.slice(
    indexOfFirst,
    indexOfLast
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [inputValue, mode]);

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

  useEffect(() => {
    fetchCategories();
  }, []);

  // ADD CATEGORY
  const handleAdd = async () => {
    if (!inputValue.trim()) {
      Swal.fire("Warning", "Please enter a category name", "warning");
      return;
    }

    try {
      const res = await createCategory({ name: inputValue.trim() });
      const newCategory = res.data || res;

      setCategories((prev) => [newCategory, ...prev]);
      setInputValue("");
      setMode("search");

      Swal.fire("Success", "Category added successfully!", "success");
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
    Swal.fire("Deleted", "Category removed", "success");
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!updatedName.trim()) return;

    await updateCategory(editingCategory._id, {
      name: updatedName.trim(),
    });

    setCategories((prev) =>
      prev.map((c) =>
        c._id === editingCategory._id
          ? { ...c, name: updatedName.trim() }
          : c
      )
    );

    setEditingCategory(null);
    Swal.fire("Success", "Category updated", "success");
  };

  if (loading) {
    return <Loader type="classification" apiDone={apiDone} />;
  }

  return (
    <div className="classification_card">
      <div className="card_header">
        <h3 className="category_title">Category</h3>

        {/* 🔍➕ Unified Input */}
        <div className="unified-input-wrapper">
          <input
            type="text"
            className="category_search_input"
            placeholder={
              mode === "search"
                ? "Search categories..."
                : "Add new category..."
            }
            value={inputValue}
            onChange={(e) =>
              setInputValue(formatValue(e.target.value))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && mode === "add") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />

          {/* MODE ICON */}
          <button
            type="button"
            className="mode-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FontAwesomeIcon
              icon={mode === "search" ? faSearch : faPlus}
            />
            <FontAwesomeIcon icon={faChevronDown} />
          </button>

          {/* DROPDOWN */}
          {dropdownOpen && (
            <div className="mode-dropdown">
              <div
                onClick={() => {
                  setMode("search");
                  setDropdownOpen(false);
                }}
              >
                <FontAwesomeIcon icon={faSearch} /> Search
              </div>

              <div
                onClick={() => {
                  setMode("add");
                  setDropdownOpen(false);
                }}
              >
                <FontAwesomeIcon icon={faPlus} /> Add
              </div>
            </div>
          )}
        </div>
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
                  {indexOfFirst + idx + 1}
                </div>
                <div className="category-name">{cat.name}</div>

                <div className="category-actions">
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setEditingCategory(cat);
                      setUpdatedName(cat.name);
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() =>
                      handleDelete(cat._id, cat.name)
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

      {/* PAGINATION */}
      {totalPages > 1 && mode === "search" && !inputValue && (
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
              className="edit-input"
              value={updatedName}
              onChange={(e) =>
                setUpdatedName(formatValue(e.target.value))
              }
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
