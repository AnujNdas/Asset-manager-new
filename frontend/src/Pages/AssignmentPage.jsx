import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import "../Page_styles/AssignmentPage.css";
import Pagination from "../Components/Pagination";

import {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  assignAssetsFromStock,
  getDepartments,
  getEmployeesByDepartment
} from "../Services/ApiServices";

const AssignmentPage = () => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =============================
     PAGINATION STATE
  ============================== */
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 16;

  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * categoriesPerPage;
    return categories.slice(startIndex, startIndex + categoriesPerPage);
  }, [categories, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [wizardData, setWizardData] = useState({
    category: null,
    assets: [],
    selectedAssets: {},
    department: "",
    employee: ""
  });

  /* =============================
     INITIAL LOAD
  ============================== */
  useEffect(() => {
    fetchCategories();
    fetchDepartments();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getInStockCategorySummary();
      console.log("Category summary", res.data);
      const data = res.data || [];
      setCategories(data);
      setCurrentPage(1); // reset pagination
    } catch {
      Swal.fire("Error", "Failed to load categories", "error");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data || res || []);
    } catch {
      Swal.fire("Error", "Failed to load departments", "error");
    }
  };

  const fetchUsers = async (departmentId) => {
    try {
      const res = await getEmployeesByDepartment(departmentId);
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
      setEmployees([]);
      Swal.fire("Error", "Failed to load employees", "error");
    }
  };

  /* =============================
     STEP NAVIGATION VALIDATION
  ============================== */
  const goNext = () => {
    if (step === 1 && !wizardData.category)
      return Swal.fire("Select a category first");

    if (step === 2) {
      const hasSelection = Object.values(wizardData.selectedAssets)
        .some(a => a.quantity > 0);
      if (!hasSelection)
        return Swal.fire("Select at least one asset");
    }

    if (step === 3 && !wizardData.department)
      return Swal.fire("Select department");

    if (step === 4 && !wizardData.employee)
      return Swal.fire("Select employee");

    setStep(prev => prev + 1);
  };

  const goBack = () => setStep(prev => prev - 1);

  /* =============================
     STEP 1 — CATEGORY
  ============================== */
  const handleCategorySelect = async (category) => {
    try {
      const res = await getInStockAssetsByCategory(category.category);
      console.log("Assets for category", category.category, res.data);
      setWizardData(prev => ({
        ...prev,
        category,
        assets: res.data || [],
        selectedAssets: {}
      }));
      setStep(2);
    } catch {
      Swal.fire("Error", "Failed to load assets", "error");
    }
  };

  /* =============================
     STEP 2 — ASSETS
  ============================== */
  const handleQtyChange = (assetId, value, max) => {
    const qty = Math.max(0, Math.min(Number(value), max));

    setWizardData(prev => ({
      ...prev,
      selectedAssets: {
        ...prev.selectedAssets,
        [assetId]: {
          ...prev.selectedAssets[assetId],
          quantity: qty,
          location: prev.selectedAssets[assetId]?.location || ""
        }
      }
    }));
  };

  /* =============================
     STEP 3 — DEPARTMENT
  ============================== */
  const handleDepartmentSelect = (depId) => {
    setWizardData(prev => ({
      ...prev,
      department: depId,
      employee: ""
    }));
    fetchUsers(depId);
  };

  /* =============================
     STEP 5 — LOCATION
  ============================== */
  const handleLocationChange = (assetId, value) => {
    setWizardData(prev => ({
      ...prev,
      selectedAssets: {
        ...prev.selectedAssets,
        [assetId]: {
          ...prev.selectedAssets[assetId],
          location: value
        }
      }
    }));
  };

  /* =============================
     FINAL SUBMIT
  ============================== */
  const handleSubmit = async () => {
    const selected = Object.entries(wizardData.selectedAssets)
      .filter(([_, val]) => val.quantity > 0);

    if (selected.some(([_, val]) => !val.location.trim()))
      return Swal.fire("All selected assets require location");

    const payload = selected.map(([assetId, val]) => {
      const asset = wizardData.assets.find(a => a._id === assetId);
      return {
        assetId,
        assetType: asset.assetType,
        departmentId: wizardData.department,
        employeeId: wizardData.employee,
        assignLocation: val.location,
        quantity: val.quantity
      };
    });

    try {
      setLoading(true);
      await assignAssetsFromStock({ assignments: payload });
      Swal.fire("Success", "Assets assigned successfully", "success");
      resetWizard();
    } catch {
      Swal.fire("Error", "Assignment failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setCurrentPage(1);
    setWizardData({
      category: null,
      assets: [],
      selectedAssets: {},
      department: "",
      employee: ""
    });
  };

  /* =============================
     RENDER
  ============================== */

  return (
    <div className="wizard-container">

      <WizardStepper step={step} />

      {step === 1 && (
        <>
          <div className="grid">
            {paginatedCategories.map(cat => (
              <div
                key={cat.category}
                className="card"
                onClick={() => handleCategorySelect(cat)}
              >
                <h3>{cat.categoryName}</h3>
                <p
  style={{
    color: cat.totalInStock < 5 ? "#dc2626" : "#16a34a",
    fontWeight: 600,
  }}
>
  {cat.totalInStock} in stock
</p>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {step === 2 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Available</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {wizardData.assets.map(asset => (
                <tr key={asset._id}>
                  <td>{asset.name}</td>
                  <td>{asset.assetType}</td>
                  <td>{asset.available}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={asset.available}
                      value={wizardData.selectedAssets[asset._id]?.quantity || ""}
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
      )}

      {step === 3 && (
        <select
          className="select-box"
          value={wizardData.department}
          onChange={(e) => handleDepartmentSelect(e.target.value)}
        >
          <option value="">Select Department</option>
          {departments.map(dep => (
            <option key={dep._id} value={dep._id}>
              {dep.name}
            </option>
          ))}
        </select>
      )}

      {step === 4 && (
        <select
          className="select-box"
          value={wizardData.employee}
          onChange={(e) =>
            setWizardData(prev => ({ ...prev, employee: e.target.value }))
          }
        >
          <option value="">Select Team Member</option>
          {employees.map(employee => (
            <option key={employee._id} value={employee._id}>
              {employee.name} ({employee.employeeCode})
            </option>
          ))}
        </select>
      )}

      {step === 5 && (
        <div className="review">
          {Object.entries(wizardData.selectedAssets)
            .filter(([_, val]) => val.quantity > 0)
            .map(([assetId, val]) => {
              const asset = wizardData.assets.find(a => a._id === assetId);
              return (
                <div key={assetId} className="review-card">
                  <h4>{asset.name}</h4>
                  <p>Quantity: {val.quantity}</p>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={val.location}
                    onChange={(e) =>
                      handleLocationChange(assetId, e.target.value)
                    }
                  />
                </div>
              );
            })}
        </div>
      )}

      <div className="wizard-footer">
        {step > 1 && (
          <button className="secondary-btn" onClick={goBack}>
            Back
          </button>
        )}

        {step < 5 ? (
          <button className="primary-btn" onClick={goNext}>
            Next
          </button>
        ) : (
          <button
            className="primary-btn"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Assigning..." : "Confirm Assignment"}
          </button>
        )}
      </div>

    </div>
  );
};

const WizardStepper = ({ step }) => {
  const steps = ["Category", "Assets", "Department", "Team Member", "Review"];

  return (
    <div className="stepper">
      {steps.map((label, index) => (
        <div
          key={index}
          className={`step ${step >= index + 1 ? "active" : ""}`}
        >
          <div className="circle">{index + 1}</div>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default AssignmentPage;