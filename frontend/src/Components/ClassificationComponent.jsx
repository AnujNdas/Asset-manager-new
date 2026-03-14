import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faRotateLeft,
  faSave,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "./Pagination";
import Loader from "./Loader";
import "../Component_styles/ClassificationComponent.css";
const ClassificationPage = ({
  title,
  getAll,
  createItem,
  updateItem,
  deleteItem,
  restoreItem,
  allowDelete = true   // NEW PROP
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [addValue, setAddValue] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(12);

useEffect(() => {
  const updateItemsPerPage = () => {
    const width = window.innerWidth;

    if (width < 500) {
      setItemsPerPage(6); // 2 columns × 3 rows
    } 
    else if (width < 900) {
      setItemsPerPage(9); // 3 columns × 3 rows
    } 
    else if (width < 1200) {
      setItemsPerPage(8); // 4 columns × 2 rows
    } 
    else {
      setItemsPerPage(12); // 6 columns × 2 rows
    }
  };

  updateItemsPerPage();
  window.addEventListener("resize", updateItemsPerPage);

  return () => window.removeEventListener("resize", updateItemsPerPage);
}, []);

  useEffect(() => {
    fetchItems();
  }, []);

const fetchItems = async () => {
  setLoading(true);
  try {
    const res = await getAll();

    const data = res?.data ?? res;

    if (!Array.isArray(data)) {
      console.error("Expected array but got:", data);
      setItems([]);
    } else {
      setItems([...data].reverse());
    }

    setApiDone(true);
    setTimeout(() => setLoading(false), 400);
  } catch (err) {
    console.error(err);
    setLoading(false);
  }
};

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!addValue.trim()) {
      Swal.fire("Warning", "Name cannot be empty", "warning");
      return;
    }

    try {
      const res = await createItem({ name: addValue.trim() });
      const newItem = res.data || res;
      setItems(prev => [newItem, ...prev]);
      setAddValue("");

      Swal.fire({
        icon: "success",
        title: `${title} Added`,
        timer: 1200,
        showConfirmButton: true,
        customClass: {
          confirmButton: "my-confirm-btn",
          cancelButton: "my-cancel-btn"
        }
      });
    } catch (err) {
      Swal.fire("Error", "Already exists", "error");
    }
  };

  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: `Deactivate ${title}?`,
      text: `Deactivate "${name}"?`,
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    await deleteItem(id);
    fetchItems();
  };

  const handleRestore = async (id) => {
    await restoreItem(id);
    fetchItems();
  };

  const handleUpdate = async () => {
    if (!updatedName.trim()) {
      Swal.fire("Warning", "Name cannot be empty", "warning");
      return;
    }

    await updateItem(editingItem._id, { name: updatedName.trim() });
    setEditingItem(null);
    fetchItems();
  };

  if (loading) return <Loader type="classification" apiDone={apiDone} />;

  return (
    <div className="classification_card">
      <div className="card_header">
        <h3 className="category_title">{title}</h3>

<div className="dual-input-container">

  {/* SEARCH SECTION */}
  <div className="input-group">
    {/* <label className="input-label">
      <FontAwesomeIcon icon={faSearch} /> Search {title}
    </label> */}

    <div className="input-with-button">
      <input
        className="category_search_input"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={`Search ${title.toLowerCase()}...`}
      />

      {/* <button
        type="button"
        className="search-btn"
        onClick={() => setCurrentPage(1)}
      >
        <FontAwesomeIcon icon={faSearch} />
      </button> */}
    </div>
  </div>

  {/* ADD SECTION */}
  <div className="input-grouped">
    {/* <label className="input-label">
      <FontAwesomeIcon icon={faPlus} /> Add New {title}
    </label> */}

    <div className="input-with-button">
      <input
        className="category_search_input"
        value={addValue}
        onChange={(e) => setAddValue(e.target.value)}
        placeholder={`Enter new ${title.toLowerCase()}...`}
      />

      <button
        type="button"
        className="add-btn"
        onClick={handleAdd}
      >
        <FontAwesomeIcon icon={faPlus} /> Add
      </button>
    </div>
  </div>

</div>
      </div>

      <div className="category-grid">
        {currentItems.length === 0 ? (
          <p>No {title.toLowerCase()} found</p>
        ) : (
          <div className="grid">
            {currentItems.map((item, idx) => (
              <div
                key={item._id}
                className={`category-card ${
                  !item.isActive ? "inactive" : ""
                }`}
              >
                <div className="category-number">
                  {startIndex + idx + 1}
                </div>

                <div className="category-name">
                  {item.name
                    ?.toLowerCase()
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </div>

                <span
                  className={`status-badge ${
                    item.isActive
                      ? "badge-active"
                      : "badge-inactive"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>

                <div className="category-actions">
                  {item.isActive ? (
                    <>
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setEditingItem(item);
                          setUpdatedName(item.name);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      {allowDelete && (
                        <button
                          className="btn-delete"
                          onClick={() =>
                            handleDelete(item._id, item.name)
                          }
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      className="btn-restore"
                      onClick={() =>
                        handleRestore(item._id)
                      }
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

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {editingItem && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit {title}</h3>

            <input
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
                onClick={() => setEditingItem(null)}
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

export default ClassificationPage;