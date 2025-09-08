import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getCoreLicenses,
  getStatuses,
  deleteCoreLicense,
  updateCoreLicense, // ✅ add update API
} from "../Services/ApiServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../Page_styles/ListPage.css";

const CoreCompanyLicenseList = () => {
  const [licenses, setLicenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statuses, setStatuses] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  // State for edit modal
  const [editingLicense, setEditingLicense] = useState(null);
  const [editForm, setEditForm] = useState({});
  useEffect(() => {
    console.log("Statuses in CoreCompanyLicense:", statuses);
  }, [statuses]);

  // Fetch licenses
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const [statusesList] = await Promise.all([getStatuses()]);
        setStatuses(statusesList);
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    };
    const fetchLicenses = async () => {
      try {
        const res = await getCoreLicenses();
        console.log(res);
        if (res.success && Array.isArray(res.data)) {
          setLicenses(res.data); // ✅ only save the array
        } else {
          setLicenses([]);
        }
      } catch (err) {
        console.error("Error fetching core licenses:", err);
        setLicenses([]);
      }
    };
    fetchLicenses();


    fetchMetaData();
  }, []);

  // Delete license
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the company license!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCoreLicense(id);
          setLicenses(licenses.filter((license) => license._id !== id));
          Swal.fire("Deleted!", "Company license has been deleted.", "success");
        } catch {
          Swal.fire("Error", "Failed to delete company license.", "error");
        }
      }
    });
  };

  // ✅ Handle Edit (open modal)
  const handleEdit = (license) => {
    setEditingLicense(license);
    setEditForm({ ...license }); // pre-fill form
  };

  // ✅ Save Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateCoreLicense(editingLicense._id, editForm);

      setLicenses((prev) =>
        prev.map((l) => (l._id === updated._id ? updated : l))
      );

      Swal.fire("Updated!", "Company license updated successfully.", "success");
      setEditingLicense(null); // close modal
    } catch (err) {
      Swal.fire("Error", "Failed to update company license.", "error");
    }
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = Array.isArray(licenses)
    ? licenses.slice(indexOfFirst, indexOfLast)
    : [];
  const totalPages = Math.ceil(licenses.length / itemsPerPage);

  return (
    <div className="list-container">
      <h2 className="list-title">🏢 Core Company Licenses</h2>

      <div className="asset-grid">
        {currentItems.map((license) => (
          <div key={license._id} className="asset-card">
            <h3>{license.licenseHolder}</h3>
            <p>
              <strong>Document Type:</strong> {license.documentType}
            </p>
            <p>
              <strong>License No:</strong> {license.licenseNumber}
            </p>
            <p>
              <strong>Issuing Authority:</strong> {license.issuingAuthority}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {statuses.find((s) => s._id === license.status)?.name || "N/A"}
            </p>
            <p>
              <strong>Expiry:</strong>{" "}
              {new Date(license.expiryDate).toLocaleDateString()}
            </p>

            <div className="card-actions">
              <button
                className="view-btn"
                onClick={() => setSelectedAsset(license)}
              >
                <FontAwesomeIcon icon={faEye} /> View
              </button>
              <button
                className="edit-btn"
                onClick={() => handleEdit(license)} // ✅ open modal
              >
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDelete(license._id)}
              >
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

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

      {/* View Overlay */}
      {selectedAsset && (
        <div className="overlay">
          <div className="overlay-content">
            <h3>{selectedAsset.licenseHolder} - Details</h3>
            <p>
              <strong>License No :</strong> {selectedAsset.licenseNumber}
            </p>
            <p>
              <strong>Document Type:</strong> {selectedAsset.documentType}
            </p>
            <p>
              <strong>Date of Issue:</strong>{" "}
              {new Date(selectedAsset.issueDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Business Activity:</strong> {selectedAsset.businessActivity}
            </p>
            <p>
              <strong>Renewal Cycle:</strong> {selectedAsset.renewalCycle}
            </p>

            <button
              className="close-btn"
              onClick={() => setSelectedAsset(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ✅ Edit Modal Overlay */}
      {editingLicense && (
        <div className="overlay">
          <div className="overlay-card">
            <h2 className="overlay-title">
              Edit License – {editingLicense.licenseHolder}
            </h2>

            <form onSubmit={handleEditSubmit} className="overlay-form">
              <div className="form-group">
                <label>Document Type</label>
                <input
                  type="text"
                  value={editForm.documentType || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, documentType: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>License Number</label>
                <input
                  type="text"
                  value={editForm.licenseNumber || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, licenseNumber: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Issuing Authority</label>
                <input
                  type="text"
                  value={editForm.issuingAuthority || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      issuingAuthority: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>License Holder</label>
                <input
                  type="text"
                  value={editForm.licenseHolder || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, licenseHolder: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={
                    editForm.expiryDate
                      ? new Date(editForm.expiryDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditForm({ ...editForm, expiryDate: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editForm.status || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                ><option value="">Select Status</option>
            {statuses.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setEditingLicense(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoreCompanyLicenseList;
