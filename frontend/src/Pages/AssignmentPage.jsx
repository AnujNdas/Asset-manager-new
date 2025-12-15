import React, { useEffect, useState } from "react";
import "../Page_styles/AssignmentPage.css";
import {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  assignAssetsFromStock,
  getDepartments,
} from "../Services/ApiServices";

const AssignmentPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(false);

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

  const openCategory = async (category) => {
    setSelectedCategory(category);
    setAssignments({});
    setSelectedDepartments([]);

    try {
      const res = await getInStockAssetsByCategory(category);
      setAssets(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const closeDrawer = () => {
    setSelectedCategory(null);
    setAssets([]);
  };

  const handleQtyChange = (assetId, value) => {
    setAssignments((prev) => ({
      ...prev,
      [assetId]: Number(value),
    }));
  };

  const handleDepartmentChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (o) => o.value);
    setSelectedDepartments(values);
  };

  // ---- ASSIGN ASSETS ----
  const submitAssignments = async () => {
    if (selectedDepartments.length === 0) {
      alert("Please select at least one department");
      return;
    }

    const payload = [];

    assets.forEach((asset) => {
      const qty = assignments[asset._id];
      if (qty && qty > 0) {
        selectedDepartments.forEach((deptId) => {
          payload.push({
            assetType: asset.assetType,
            assetId: asset._id,
            departmentId: deptId,
            quantity: qty,
          });
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
      closeDrawer();
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
            onClick={() => openCategory(cat.category)}
          >
            <h3>{cat.category}</h3>
            <span>{cat.totalInStock} in stock</span>
            <div className="counts">
              <p>Hardware: {cat.hardwareCount}</p>
              <p>Software: {cat.softwareCount}</p>
            </div>
          </div>
        ))}
      </div>

      {/* DRAWER */}
      {selectedCategory && (
        <div className="drawer-overlay">
          <div className="drawer">
            <div className="drawer-header">
              <h2>{selectedCategory} Assets</h2>
              <button onClick={closeDrawer}>✕</button>
            </div>

            <div className="drawer-body">
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
                            handleQtyChange(asset._id, e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="department-section">
                <label>Assign to Departments</label>
                <select
                  multiple
                  value={selectedDepartments}
                  onChange={handleDepartmentChange}
                >
                  {departments.map((dep) => (
                    <option key={dep._id} value={dep._id}>
                      {dep.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="drawer-footer">
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
