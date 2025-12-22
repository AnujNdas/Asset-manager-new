import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const preselect = location.state; // { categoryId, assetId, assetType }

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
    } catch {
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
     AUTO-OPEN CATEGORY FROM INVENTORY
  ========================== */
  useEffect(() => {
    if (!preselect?.categoryId || !categories.length) return;

    const cat = categories.find(
      (c) => String(c.category) === String(preselect.categoryId)
    );

    if (cat) {
      openCategory(cat);
    }
  }, [categories]);

  /* =========================
     SEARCH + PAGINATION
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
     CATEGORY MODAL
  ========================== */
  const openCategory = async (categoryObj) => {
    setSelectedCategory(categoryObj);
    setAssignments({});
    setSelectedDepartment("");

    try {
      const res = await getInStockAssetsByCategory(categoryObj.category);
      const assetList = res.data || [];
      setAssets(assetList);

      // ✅ Pre-select asset when coming from Inventory
      if (preselect?.assetId) {
        const match = assetList.find(
          (a) => String(a._id) === String(preselect.assetId)
        );
        if (match) {
          setAssignments({ [match._id]: 1 });
        }
      }
    } catch {
      Swal.fire("Error", "Failed to load assets", "error");
    }
  };

  const closeModal = () => {
    setSelectedCategory(null);
    setAssets([]);
    setAssignments({});
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
      Swal.fire("Warning", "Please select a department", "warning");
      return;
    }

    const payload = assets
      .filter((a) => assignments[a._id] > 0)
      .map((a) => ({
        assetId: a._id,
        assetType: a.assetType,
        assetModel: a.assetType === "software" ? "SoftwareAsset" : "Asset",
        assignedToType: "Department",
        assignedTo: selectedDepartment,
        quantity: assignments[a._id],
      }));

    if (!payload.length) {
      Swal.fire("Info", "No assets selected", "info");
      return;
    }

    try {
      setLoading(true);
      await assignAssetsFromStock({ assignments: payload });

      Swal.fire("Success", "Assets assigned successfully", "success");

      closeModal();
      fetchCategorySummary();
    } catch {
      Swal.fire("Error", "Assignment failed", "error");
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
              <h2>{selectedCategory.categoryName}</h2>
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
                  {assets.map((asset) => {
                    const locked =
                      preselect?.assetId &&
                      String(asset._id) !== String(preselect.assetId);

                    return (
                      <tr
                        key={asset._id}
                        className={locked ? "disabled-row" : ""}
                      >
                        <td>{asset.name}</td>
                        <td>{asset.assetType}</td>
                        <td>{asset.available}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={asset.available}
                            disabled={locked}
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
                    );
                  })}
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
