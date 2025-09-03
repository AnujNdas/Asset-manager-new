import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getCoreLicenses,
  deleteCoreLicense,
} from "../Services/ApiServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../Page_styles/ListPage.css";

const CoreCompanyLicenseList = () => {
  const [licenses, setLicenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  // Fetch licenses
useEffect(() => {
  const fetchLicenses = async () => {
    try {
      const res = await getCoreLicenses();
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

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  console.log(licenses)
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
              <strong>Status:</strong> {license.status}
            </p>
            <p>
              <strong>Expiry:</strong>{" "}
              {new Date(license.expiryDate).toLocaleDateString()}
            </p>

            <div className="card-actions">
              <button
                className="view-btn"
                onClick={() => navigate(`/core-licenses/${license._id}`)}
              >
                <FontAwesomeIcon icon={faEye} /> View
              </button>
              <button
                className="edit-btn"
                onClick={() => navigate(`/core-licenses/edit/${license._id}`)}
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
    </div>
  );
};

export default CoreCompanyLicenseList;
