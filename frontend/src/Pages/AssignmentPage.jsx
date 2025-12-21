import React, { useEffect, useMemo, useState } from "react";
import "../Page_styles/AssignmentPage.css";
import Pagination from "../Components/Pagination";
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
      console.error("Failed to fetch categories", err);
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
    } catch (err) {
      console.error("Failed to load departments", err);
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
    const end = start + PAGE_SIZE;
    return filteredCategories.slice(start, end);
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
    } catch (err) {
      console.error("Failed to load assets", err);
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
      alert("Please select a department");
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
      alert("No assets selected");
      return;
    }

    try {
      setLoading(true);
      await assignAssetsFromStock({ assignments: payload });
      alert("Assets assigned successfully");
      closeModal();
      fetchCategorySummary();
    } catch {
      alert("Assignment failed");
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

      {/* CATEGORY SEARCH */}
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

      {/* CATEGORY GRID */}
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

      {/* PAGINATION (CATEGORIES ONLY) */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* MODAL */}
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
