import React, { useEffect, useMemo, useState } from "react";
import "../Page_styles/AssignmentPage.css";
import Pagination from "../Components/Pagination";
import Swal from "sweetalert2";
import {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  assignAssetsFromStock,
  getDepartments,
} from "../Services/ApiServices";

const PAGE_SIZE = 8;

const AssignmentPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  /* =========================
     INITIAL LOAD
  ========================== */
  useEffect(() => {
    fetchCategorySummary();
    fetchDepartments();
  }, []);

  const fetchCategorySummary = async () => {
    try {
      const res = await getInStockCategorySummary();
      setCategories(res.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load categories", "error");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setDepartments(list);
    } catch {
      Swal.fire("Error", "Failed to load departments", "error");
      setDepartments([]);
    }
  };

  /* =========================
     CATEGORY SEARCH + PAGINATION
  ========================== */
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      (cat.categoryName || cat.category)
        .toLowerCase()
        .includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const totalPages = Math.ceil(filteredCategories.length / PAGE_SIZE);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCategories.slice(start, start + PAGE_SIZE);
  }, [filteredCategories, currentPage]);

  /* =========================
     MODAL HANDLERS
  ========================== */
  const openCategory = async (categoryObj) => {
    setSelectedCategory(categoryObj);
    setAssignments({});
    setSelectedDepartment("");

    try {
      const res = await getInStockAssetsByCategory(categoryObj.category);
      setAssets(res.data || []);
    } catch {
      Swal.fire("Error", "Failed to load assets", "error");
    }
  };

  const closeModal = () => {
    setSelectedCategory(null);
    setAssets([]);
  };

  const handleQtyChange = (assetId, value, max) => {
    const qty = Math.max(0, Math.min(Number(value), max));
    setAssignments((prev) => ({ ...prev, [assetId]: qty }));
  };

  /* =========================
     SUBMIT ASSIGNMENT
  ========================== */
  const submitAssignments = async () => {
    if (!selectedDepartment) {
      Swal.fire({
        icon: "warning",
        title: "Department Required",
        text: "Please select a department before assigning assets.",
      });
      return;
    }

    const payload = [];

    assets.forEach((asset) => {
      const qty = assignments[asset._id];
      if (qty && qty > 0) {
        payload.push({
          assetId: asset._id,
          assetType: asset.assetType,
          assetModel:
            asset.assetType === "software" ? "SoftwareAsset" : "Asset",
          assignedToType: "Department",
          assignedTo: selectedDepartment,
          quantity: qty,
        });
      }
    });

    if (!payload.length) {
      Swal.fire({
        icon: "info",
        title: "No Assets Selected",
        text: "Please enter at least one quantity to assign.",
      });
      return;
    }

    try {
      setLoading(true);
      await assignAssetsFromStock({ assignments: payload });

      Swal.fire({
        icon: "success",
        title: "Assignment Successful",
        text: "Assets have been assigned successfully.",
      });

      closeModal();
      fetchCategorySummary();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Assignment Failed",
        text: "Something went wrong while assigning assets.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="assignment-page">
      <div className="page-header">
        <h1>Asset Assignment</h1>
        <p>Assign in-stock assets to departments</p>
      </div>

      <div className="category-search">
        <input
          type="text"
          placeholder="Search category..."
          value={categorySearch}
          onChange={(e) => {
            setCategorySearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="stock-grid">
        {paginatedCategories.map((cat) => (
          <div
            key={cat.category}
            className="asset-card"
            onClick={() => openCategory(cat)}
          >
            <h3>
              {cat.categoryName || cat.category}
              {!cat.isActive && (
                <span className="inactive-tag">Deactivated</span>
              )}
            </h3>

            <span>{cat.totalInStock} in stock</span>

            <div className="counts">
              <p>Hardware: {cat.hardwareCount}</p>
              <p>Software: {cat.softwareCount}</p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {selectedCategory && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {selectedCategory.categoryName ||
                  selectedCategory.category}
              </h2>
              <button onClick={closeModal}>✕</button>
            </div>

            <div className="modal-controls">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">Select Department</option>
                {departments.map((dep) => (
                  <option key={dep._id} value={dep._id}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-body">
              <table className="asset-table">
                <thead>
                  <tr>
                    <th>Asset Name</th>
                    <th>Type</th>
                    <th>Available</th>
                    <th>Assign Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset._id}>
                      <td>{asset.name || asset.assetName}</td>
                      <td>{asset.assetType}</td>
                      <td>{asset.available}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={asset.available}
                          value={assignments[asset._id] || ""}
                          onChange={(e) =>
                            handleQtyChange(
                              asset._id,
                              e.target.value,
                              asset.available
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button
                className="assign-btn"
                disabled={loading}
                onClick={submitAssignments}
              >
                {loading ? "Assigning..." : "Assign Assets"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentPage;
