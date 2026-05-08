import React, { useEffect, useState } from "react";
import ThemeSwal from "../utils/SwalTheme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSave,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "./Pagination";
import Loader from "./Loader";
import "../Component_styles/ClassificationComponent.css";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTour } from "../Context/TourContext";
const ClassificationPage = ({
  title,
  getAll,
  createItem,
  updateItem,
  deleteItem,
  restoreItem,
  allowDelete = true   // NEW PROP
}) => {
      const { registerTour } = useTour();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [addValue, setAddValue] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

        const driverObj = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,
        allowClose: true,
    
        overlayColor: "rgba(0,0,0,0.75)",
    
        popoverClass: "custom-driver-popover",
    
        steps: [
          {
            element: ".tour-search",
            popover: {
              title: "Search",
              description: "Search for classification.",
              side: "bottom",
              align: "start",
            },
          },
    
          {
            element: ".tour-add",
            popover: {
              title: "Add",
              description:
                "Add New ones.",
              side: "bottom",
            },
          },
          {
            element: ".tour-info",
            popover: {
              title: "Info",
              description:
                "You can edit & delete from here.",
              side: "bottom",
            },
          },
        ],
      });
    
      useEffect(() => {
        const seen = localStorage.getItem("inventoryTourSeen");
      
        if (!seen) {
          setTimeout(() => {
            driverObj.drive();
      
            localStorage.setItem(
              "inventoryTourSeen",
              "true"
            );
          }, 1000);
        }
      }, []);
      useEffect(() => {
      registerTour(driverObj);
    }, []);

  useEffect(() => {
    fetchItems();
  }, []);

const fetchItems = async () => {
  setLoading(true);
  try {
    const res = await getAll();
    console.log(`Fetched ${title}:`, res);

    const data = Array.isArray(res)
  ? res
  : Array.isArray(res?.data)
  ? res.data
  : Array.isArray(res?.data?.data)
  ? res.data.data
  : [];

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
  if (currentPage > totalPages) {
    setCurrentPage(1);
  }
}, [filteredItems]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!addValue.trim()) {
      ThemeSwal.fire("Warning", "Name cannot be empty", "warning");
      return;
    }

    try {
      const res = await createItem({ name: addValue.trim() });
      const newItem = res.data || res;
      setItems(prev => [newItem, ...prev]);
      setAddValue("");

      ThemeSwal.fire({
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
      ThemeSwal.fire("Error", "Already exists", "error");
    }
  };

  const handleDelete = async (id, name) => {
    const confirm = await ThemeSwal.fire({
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
      ThemeSwal.fire("Warning", "Name cannot be empty", "warning");
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
<div className="dual-input-container">
        <h3 className="category_title">{title}</h3>


  {/* SEARCH SECTION */}
  <div className="input-group">
    {/* <label className="input-label">
      <FontAwesomeIcon icon={faSearch} /> Search {title}
    </label> */}

      <input
        className="category_search_input tour-search"
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

  {/* ADD SECTION */}

</div>
  <div className="input-grouped">
    {/* <label className="input-label">
      <FontAwesomeIcon icon={faPlus} /> Add New {title}
    </label> */}

    <div className="input-with-button tour-add">
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

<div className="classification-table-wrapper">

  {currentItems.length === 0 ? (
    <p className="no-data">No {title.toLowerCase()} found</p>
  ) : (
    <table className="classification-table tour-info">
      <thead>
        <tr>
          <th>#</th>
          <th>{title} Name</th>
          <th>Status</th>
          <th className="actions-column">Actions</th>
        </tr>
      </thead>

      <tbody>
        {currentItems.map((item, idx) => (
          <tr
            key={item._id}
            className={!item.isActive ? "row-inactive" : ""}
          >
            <td>{startIndex + idx + 1}</td>

            <td className="name-cell">
              {item.name
                ?.toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </td>

            <td>
              <span
                className={`status-badge ${
                  item.isActive
                    ? "badge-active"
                    : "badge-inactive"
                }`}
              >
                {item.isActive ? "Active" : "Inactive"}
              </span>
            </td>

            <td className="table-actions">
              {item.isActive ? (
                <>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditingItem(item);
                      setUpdatedName(item.name);
                    }}
                  >
                    Edit
                  </button>

                  {allowDelete && (
                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(item._id, item.name)
                      }
                    >
                      Delete
                    </button>
                  )}
                </>
              ) : (
                <button
                  className="btn-restore"
                  onClick={() => handleRestore(item._id)}
                >
                  Restore
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}

</div>

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>

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