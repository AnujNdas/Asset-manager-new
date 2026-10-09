import React, { useEffect, useState } from "react";
import ThemeSwal from "../utils/swalTheme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  FiLayers,
  FiSearch,
  FiX,
  FiPlus,
  FiInbox,
  FiTag,
  FiEdit2,
  FiTrash2,
  FiRotateCcw,
  FiSave,
} from "react-icons/fi";
import Pagination from "./Pagination";
import Loader from "./Loader";
import "../Component_styles/ClassificationComponent.css";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTour } from "../Context/TourContext";
import { useLocation, useNavigate } from "react-router-dom";
const ClassificationPage = ({
  title,
  getAll,
  createItem,
  updateItem,
  deleteItem,
  restoreItem,
  allowDelete = true   // NEW PROP
}) => {
      const location = useLocation();
const navigate = useNavigate();
const { registerTour, startTour } = useTour();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [addValue, setAddValue] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

//         const driverObj = driver({
//         showProgress: true,
//         animate: true,
//         smoothScroll: true,
//         allowClose: true,
    
//         overlayColor: "rgba(0,0,0,0.75)",
    
//         popoverClass: "custom-driver-popover",
    
//         steps: [
//           {
//             element: ".tour-search",
//             popover: {
//               title: "Search",
//               description: "Search for classification.",
//               side: "bottom",
//               align: "start",
//             },
//           },
    
//           {
//             element: ".tour-add",
//             popover: {
//               title: "Add",
//               description:
//                 "Add New ones.",
//               side: "bottom",
//             },
//           },
// {
//   element: ".tour-info",
//   popover: {
//     title: "Info",
//     description:
//       "You can edit & delete from here.",
//     side: "bottom",

//     onNextClick: () => {

//       driverObj.destroy();

//       localStorage.setItem(
//         "classificationTourSeen",
//         "true"
//       );

//       navigate("/employee", {
//         state: {
//           startGuide: true,
//         },
//       });

//     },
//   },
// },
//         ],
//       });
    
// useEffect(() => {
//   const shouldStart =
//     location.state?.startGuide &&
//     !localStorage.getItem("classificationTourSeen");

//   if (shouldStart) {
//     setTimeout(() => {
//       driverObj.drive();
//     }, 700);
//   }
// }, []);
//       useEffect(() => {
//       registerTour(driverObj);
//     }, []);

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

  {/* ================= HEADER ================= */}

  <div className="card_header">

    <div className="classification_inner_heading">
      <span className="classification_inner_eyebrow">
        CLASSIFICATION MANAGEMENT
      </span>

      <h3 className="category_title">{title}</h3>

      <p>
        Manage {title.toLowerCase()} records and their availability.
      </p>
    </div>

    <span className="classification_inner_count">
      <FiLayers />
      {currentItems.length} Displayed
    </span>

  </div>


  {/* ================= SEARCH AND ADD ================= */}

  <div className="classification_inner_toolbar">

    <div className="dual-input-container">

      <div className="input-group classification_inner_search">

        <FiSearch className="classification_inner_input_icon" />

        <input
          className="category_search_input tour-search"
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}...`}
          aria-label={`Search ${title}`}
        />

        {searchValue && (
          <button
            type="button"
            className="classification_inner_clear"
            onClick={() => setSearchValue("")}
            aria-label="Clear search"
          >
            <FiX />
          </button>
        )}

      </div>

    </div>


    <div className="input-grouped">

      <div className="input-with-button tour-add">

        <div className="classification_inner_add_input">

          <FiPlus className="classification_inner_input_icon" />

          <input
            className="category_search_input"
            type="text"
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
            placeholder={`Enter new ${title.toLowerCase()}...`}
            aria-label={`New ${title} name`}
          />

        </div>

        <button
          type="button"
          className="add-btn classification_inner_add_btn"
          onClick={handleAdd}
        >
          <FiPlus />
          <span>Add {title}</span>
        </button>

      </div>

    </div>

  </div>


  {/* ================= TABLE ================= */}

  <div className="classification-table-wrapper">

    {currentItems.length === 0 ? (

      <div className="no-data classification_inner_empty">
        <FiInbox />
        <h4>No {title.toLowerCase()} found</h4>
        <p>
          No records match your current selection.
        </p>
      </div>

    ) : (

      <>

        {/* DESKTOP TABLE */}

        <div className="classification_inner_desktop">

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

                  <td>
                    <span className="classification_inner_row_number">
                      {startIndex + idx + 1}
                    </span>
                  </td>


                  <td className="name-cell">

                    <div className="classification_inner_name">

                      <span className="classification_inner_name_icon">
                        <FiTag />
                      </span>

                      <strong>
                        {item.name
                          ?.toLowerCase()
                          .replace(/\b\w/g, (char) =>
                            char.toUpperCase()
                          )}
                      </strong>

                    </div>

                  </td>


                  <td>

                    <span
                      className={`status-badge ${
                        item.isActive
                          ? "badge-active"
                          : "badge-inactive"
                      }`}
                    >
                      <span className="classification_inner_status_dot" />
                      {item.isActive ? "Active" : "Inactive"}
                    </span>

                  </td>


                  <td className="table-actions">

                    <div className="classification_inner_actions">

                      {item.isActive ? (

                        <>

                          <button
                            type="button"
                            className="edit-btn classification_inner_edit_btn"
                            onClick={() => {
                              setEditingItem(item);
                              setUpdatedName(item.name);
                            }}
                          >
                            <FiEdit2 />
                            Edit
                          </button>


                          {allowDelete && (

                            <button
                              type="button"
                              className="delete-btn classification_inner_delete_btn"
                              onClick={() =>
                                handleDelete(item._id, item.name)
                              }
                            >
                              <FiTrash2 />
                              Delete
                            </button>

                          )}

                        </>

                      ) : (

                        <button
                          type="button"
                          className="btn-restore classification_inner_restore_btn"
                          onClick={() => handleRestore(item._id)}
                        >
                          <FiRotateCcw />
                          Restore
                        </button>

                      )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


        {/* MOBILE CARDS */}

        <div className="classification_inner_mobile">

          {currentItems.map((item, idx) => (

            <div
              key={item._id}
              className={`classification_inner_mobile_card ${
                !item.isActive ? "row-inactive" : ""
              } tour-info`}
            >

              <div className="classification_inner_mobile_header">

                <div className="classification_inner_mobile_title">

                  <span className="classification_inner_name_icon">
                    <FiTag />
                  </span>

                  <div>
                    <span className="classification_inner_mobile_index">
                      #{startIndex + idx + 1}
                    </span>

                    <h4>
                      {item.name
                        ?.toLowerCase()
                        .replace(/\b\w/g, (char) =>
                          char.toUpperCase()
                        )}
                    </h4>
                  </div>

                </div>

                <span
                  className={`status-badge ${
                    item.isActive
                      ? "badge-active"
                      : "badge-inactive"
                  }`}
                >
                  <span className="classification_inner_status_dot" />
                  {item.isActive ? "Active" : "Inactive"}
                </span>

              </div>


              <div className="classification_inner_mobile_actions">

                {item.isActive ? (

                  <>

                    <button
                      type="button"
                      className="edit-btn classification_inner_edit_btn"
                      onClick={() => {
                        setEditingItem(item);
                        setUpdatedName(item.name);
                      }}
                    >
                      <FiEdit2 />
                      Edit
                    </button>

                    {allowDelete && (

                      <button
                        type="button"
                        className="delete-btn classification_inner_delete_btn"
                        onClick={() =>
                          handleDelete(item._id, item.name)
                        }
                      >
                        <FiTrash2 />
                        Delete
                      </button>

                    )}

                  </>

                ) : (

                  <button
                    type="button"
                    className="btn-restore classification_inner_restore_btn"
                    onClick={() => handleRestore(item._id)}
                  >
                    <FiRotateCcw />
                    Restore
                  </button>

                )}

              </div>

            </div>

          ))}

        </div>

      </>

    )}

  </div>


  {/* ================= PAGINATION ================= */}

  <div className="classification_inner_pagination">

    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />

  </div>


  {/* ================= EDIT MODAL ================= */}

  {editingItem && (

    <div className="edit-modal classification_inner_modal_overlay">

      <div
        className="edit-modal-content classification_inner_modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="classification-edit-title"
      >

        <div className="classification_inner_modal_header">

          <div className="classification_inner_modal_heading">

            <span className="classification_inner_modal_icon">
              <FiEdit2 />
            </span>

            <div>
              <span className="classification_inner_eyebrow">
                UPDATE CLASSIFICATION
              </span>

              <h3 id="classification-edit-title">
                Edit {title}
              </h3>

              <p>Update the selected record name.</p>
            </div>

          </div>

          <button
            type="button"
            className="classification_inner_modal_close"
            onClick={() => setEditingItem(null)}
            aria-label="Close edit dialog"
          >
            <FiX />
          </button>

        </div>


        <div className="classification_inner_modal_body">

          <label htmlFor="classification-edit-name">
            {title} Name
          </label>

          <input
            id="classification-edit-name"
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
            className="edit-input"
            placeholder={`Enter ${title.toLowerCase()} name`}
          />

        </div>


        <div className="modal-buttons classification_inner_modal_footer">

          <button
            type="button"
            className="cancel-btn"
            onClick={() => setEditingItem(null)}
          >
            <FiX />
            Cancel
          </button>

          <button
            type="button"
            className="save-btn"
            onClick={handleUpdate}
          >
            <FiSave />
            Save Changes
          </button>

        </div>

      </div>

    </div>

  )}

</div>

  );
};

export default ClassificationPage;