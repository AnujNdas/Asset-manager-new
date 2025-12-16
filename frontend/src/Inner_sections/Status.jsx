import React, { useState, useEffect } from "react";
import "../Page_styles/Unit.css";
import {
  getStatuses,
  createStatus,
  deleteStatus,
  updateStatus,
  restoreStatus,
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

const Status = () => {
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState("search");
  const [showDropdown, setShowDropdown] = useState(false);

  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  const [editingStatus, setEditingStatus] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  const capitalize = (v) =>
    v ? v.charAt(0).toUpperCase() + v.slice(1) : v;

  /* ================= FETCH ================= */
  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const data = await getStatuses();
      setStatuses([...data].reverse());
      setApiDone(true);
      setTimeout(() => setLoading(false), 400);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  /* ================= FILTER ================= */
  const filteredStatuses =
    mode === "search"
      ? statuses.filter((s) =>
          s.name.toLowerCase().includes(inputValue.toLowerCase())
        )
      : statuses;

  useEffect(() => {
    setCurrentPage(1);
  }, [inputValue, mode]);

  const totalPages = Math.ceil(filteredStatuses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredStatuses.slice(
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
      const res = await createStatus({
        name: capitalize(inputValue.trim()),
      });

      const newStatus = res.data || res;
      setStatuses((prev) => [newStatus, ...prev]);
      setInputValue("");

      Swal.fire({
        icon: "success",
        title: "Status Added",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "Status already exists",
        "error"
      );
    }
  };

  /* ================= DELETE (SOFT) ================= */
  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: "Deactivate Status?",
      text: `"${name}" will be deactivated`,
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    await deleteStatus(id);
    fetchStatuses();

    Swal.fire("Deactivated!", "Status is now inactive", "success");
  };

  /* ================= RESTORE ================= */
  const handleRestore = async (id, name) => {
    const confirm = await Swal.fire({
      title: "Restore Status?",
      text: `Restore "${name}"?`,
      icon: "question",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    await restoreStatus(id);
    fetchStatuses();

    Swal.fire("Restored!", "Status is active again", "success");
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    if (!updatedName.trim()) {
      Swal.fire("Warning", "Status name cannot be empty", "warning");
      return;
    }

    await updateStatus(editingStatus._id, {
      name: capitalize(updatedName.trim()),
    });

    fetchStatuses();
    Swal.fire("Updated", "Status updated", "success");
    setEditingStatus(null);
  };

  if (loading) return <Loader type="classification" apiDone={apiDone} />;

  return (
    <div className="classification_card">
      <div className="card_header">
        <h3 className="category_title">Status</h3>

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
                <div onClick={() => { setMode("search"); setShowDropdown(false); }}>
                  <FontAwesomeIcon icon={faSearch} /> Search
                </div>
                <div onClick={() => { setMode("add"); setShowDropdown(false); }}>
                  <FontAwesomeIcon icon={faPlus} /> Add
                </div>
              </div>
            )}
          </div>

          <input
            type="text"
            className="category_search_input"
            placeholder={
              mode === "search" ? "Search status..." : "Add new status..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(capitalize(e.target.value))}
          />
        </form>
      </div>

      {/* LIST */}
      <div className="category-grid">
        {currentItems.length === 0 ? (
          <p>No statuses found</p>
        ) : (
          <div className="grid">
            {currentItems.map((status, idx) => (
              <div
                key={status._id}
                className={`category-card ${!status.isActive ? "inactive" : ""}`}
              >
                <div className="category-number">
                  {startIndex + idx + 1}
                </div>

                <div className="category-name">{status.name}</div>

                <span
  className={`status-badge ${
    status.isActive ? "badge-active" : "badge-inactive"
  }`}
  title={
    status.isActive
      ? "This status is currently active"
      : "This status is currently inactive"
  }
>
  {status.isActive ? "Active" : "Inactive"}
</span>


                <div className="category-actions">
                  {status.isActive ? (
                    <>
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setEditingStatus(status);
                          setUpdatedName(status.name);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() =>
                          handleDelete(status._id, status.name)
                        }
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn-restore"
                      onClick={() =>
                        handleRestore(status._id, status.name)
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

      {/* PAGINATION */}
      {mode === "search" && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* EDIT MODAL */}
      {editingStatus && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Status</h3>

            <input
              className="edit-input"
              value={updatedName}
              onChange={(e) =>
                setUpdatedName(capitalize(e.target.value))
              }
            />

            <div className="modal-buttons">
              <button className="save-btn" onClick={handleUpdate}>
                <FontAwesomeIcon icon={faSave} /> Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditingStatus(null)}
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

export default Status;
