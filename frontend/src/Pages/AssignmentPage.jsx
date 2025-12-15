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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(false);

  // 🔍 CATEGORY SEARCH
  const [categorySearch, setCategorySearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCategorySummary();
    fetchDepartments();
  }, []);

  const fetchCategorySummary = async () => {
    try {
      const res = await getInStockCategorySummary();
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openCategory = async (categoryObj) => {
    setSelectedCategory(categoryObj);
    setAssignments({});
    setSelectedDepartment("");
    setCurrentPage(1);

    try {
      const res = await getInStockAssetsByCategory(categoryObj.category);
      setAssets(res.data || []);
    } catch (err) {
      console.error(err);
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

  // ✅ FILTER CATEGORIES
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      (cat.categoryName || cat.category)
        .toLowerCase()
        .includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const totalPages = Math.ceil(assets.length / PAGE_SIZE);

  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return assets.slice(start, start + PAGE_SIZE);
  }, [assets, currentPage]);

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
          departmentId: selectedDepartment,
          quantity: qty,
        });
      }
    });

    if (payload.length === 0) {
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

  return (
    <div className="assignment-page">
      <div className="page-header">
        <h1>Asset Assignment</h1>
        <p>Assign in-stock assets to departments</p>
      </div>

      {/* 🔍 CATEGORY SEARCH */}
      <div className="category-search">
        <input
          type="text"
          placeholder="Search category..."
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
        />
      </div>

      {/* CATEGORY GRID */}
      <div className="stock-grid">
        {filteredCategories.map((cat) => (
          <div
            key={cat.category}
            className="asset-card"
            onClick={() => openCategory(cat)}
          >
            <h3>{cat.categoryName || cat.category}</h3>
            <span>{cat.totalInStock} in stock</span>

            <div className="counts">
              <p>Hardware: {cat.hardwareCount}</p>
              <p>Virtual: {cat.softwareCount}</p>
            </div>
          </div>
        ))}
      </div>

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
                  {paginatedAssets.map((asset) => (
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

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
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
