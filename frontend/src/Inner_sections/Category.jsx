import React, { useState, useEffect } from "react";
import "../Page_styles/Unit.css";
import {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  restoreCategory,
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
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import Pagination from "../Components/Pagination";
import Loader from "../Components/Loader";

const Category = () => {
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState("search");
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

  const capitalize = (value) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
      setApiDone(true);
      setTimeout(() => setLoading(false), 300);
    } catch {
      setLoading(false);
    }
  };

  /* ================= SEARCH FILTER ================= */
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

  /* ================= ADD ================= */
  const handleAction = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      Swal.fire("Warning", "Input cannot be empty", "warning");
      return;
    }

    if (mode === "search") return;

    try {
      await createCategory({ name: capitalize(inputValue.trim()) });
      setInputValue("");
      fetchCategories();

      Swal.fire({
        icon: "success",
        title: "Category Added",
        timer: 1400,
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

  /* ================= DEACTIVATE ================= */
  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: "Deactivate Category?",
      text: `Deactivate "${name}"?`,
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    await deleteCategory(id);
    fetchCategories();

    Swal.fire("Deactivated", "Category deactivated", "success");
  };

  /* ================= RESTORE ================= */
const handleRestore = async (id, name) => {
  const confirm = await Swal.fire({
    title: "Restore Category?",
    text: `Restore "${name}"?`,
    icon: "question",
    showCancelButton: true
  });

  if (!confirm.isConfirmed) return;

  await restoreCategory(id);

  setCategories(prev =>
    prev.map(cat =>
      cat._id === id ? { ...cat, isActive: true } : cat
    )
  );

  Swal.fire("Restored", "Category restored successfully", "success");
};

  /* ================= UPDATE ================= */
  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setUpdatedName(cat.name);
  };

  const handleUpdate = async () => {
    await updateCategory(editingCategory._id, {
      name: capitalize(updatedName.trim()),
    });

    Swal.fire("Updated", "Category updated", "success");
    setEditingCategory(null);
    fetchCategories();
  };

  if (loading) return <Loader type="classification" apiDone={apiDone} />;

  return (
    <div className="classification_card">
      <div className="card_header">
        <h3 className="category_title">Category</h3>

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
              <div
                key={cat._id}
                className={`category-card ${
                  !cat.isActive ? "inactive" : ""
                }`}
              >
                <div className="category-number">
                  {startIndex + idx + 1}
                </div>

               <div className="category-name">
  {cat.name}

  <span
    className={`status-badge ${
      cat.isActive ? "badge-active" : "badge-inactive"
    }`}
    title={
      cat.isActive
        ? "This category is active"
        : "This category is inactive"
    }
  >
    {cat.isActive ? "Active" : "Inactive"}
  </span>
</div>


                <div className="category-actions">
  {cat.isActive ? (
    <>
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
    </>
  ) : (
    <button
      className="btn-restore"
      onClick={() => handleRestore(cat._id, cat.name)}
    >
      <FontAwesomeIcon icon={faRotateLeft} />
    </button>
  )}
</div>

              </div>
            ))}
          </div>
        )}
      </div>

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
              disabled={!editingCategory.isActive}
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
