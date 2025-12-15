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

  // search + pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ---- INITIAL LOAD ----
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
    setSearch("");
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
    const qty = Math.min(Number(value), max);
    setAssignments((prev) => ({ ...prev, [assetId]: qty }));
  };

  // ---- FILTERED + PAGINATED ASSETS ----
  const filteredAssets = useMemo(() => {
    return assets.filter((a) =>
      (a.name || a.assetName)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [assets, search]);

  const totalPages = Math.ceil(filteredAssets.length / PAGE_SIZE);

  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAssets.slice(start, start + PAGE_SIZE);
  }, [filteredAssets, currentPage]);

  // ---- ASSIGN ASSETS ----
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
          assetType: asset.assetType,
          assetId: asset._id,
          departmentId: selectedDepartment,
          quantity: qty,
        });
      }
    });

    if (payload.length === 0) {
      alert("No valid asset quantities selected");
      return;
    }

    try {
      setLoading(true);
      await assignAssetsFromStock({ assignments: payload });
      alert("Assets assigned successfully");
      closeModal();
      fetchCategorySummary();
    } catch (err) {
      alert(err?.message || "Assignment failed");
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

      {/* CATEGORY GRID */}
      <div className="category-grid">
        {categories.map((cat) => (
          <div
            key={cat.category}
            className="category-card"
            onClick={() => openCategory(cat)}
          >
            <h3>{cat.categoryName || cat.category}</h3>
            <span>{cat.totalInStock} in stock</span>
            <div className="counts">
              <p>Hardware: {cat.hardwareCount}</p>
              <p>Software: {cat.softwareCount}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedCategory && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{selectedCategory.categoryName || selectedCategory.category}</h2>
              <button onClick={closeModal}>✕</button>
            </div>

            <div className="modal-controls">
              <input
                type="text"
                placeholder="Search assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

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
