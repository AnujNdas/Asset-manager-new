// ✅ src/Pages/AssignmentPage.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../Page_styles/AssignmentPage.css";

import {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  assignAssetsFromStock,
  getDepartments,
  getEmployeesByDepartment
} from "../Services/ApiServices";

const steps = [
  "Category",
  "Assets",
  "Instances",
  "Assignment",
  "Review"
];

const AssignmentPage = () => {
  const [step, setStep] = useState(0);

  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [instances, setInstances] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedInstances, setSelectedInstances] = useState([]);

  const [assetTypeFilter, setAssetTypeFilter] = useState("all");

  const [assignmentData, setAssignmentData] = useState({
    department: "",
    employee: "",
    location: "",
    deviceName: "",
    deviceTag: ""
  });

  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    fetchCategories();
    fetchDepartments();
  }, []);

  const fetchCategories = async () => {
    const res = await getInStockCategorySummary();
    setCategories(res.data || []);
  };

  const fetchDepartments = async () => {
    const res = await getDepartments();
    setDepartments(res.data || res || []);
  };

  /* ================= STEP 1 ================= */
  const selectCategory = async (cat) => {
    setSelectedCategory(cat);
    const res = await getInStockAssetsByCategory(cat.category);
    setAssets(res.data || []);
    setFilteredAssets(res.data || []);
    setStep(1);
  };

  /* ================= STEP 2 ================= */
  useEffect(() => {
    if (assetTypeFilter === "all") {
      setFilteredAssets(assets);
    } else {
      setFilteredAssets(
        assets.filter(a => a.assetType === assetTypeFilter)
      );
    }
  }, [assetTypeFilter, assets]);

  const selectAsset = (asset) => {
    setSelectedAsset(asset);

    // 🔥 IMPORTANT: instances should come from asset.instances
    setInstances(asset.instances || []);
    setSelectedInstances([]);
    setStep(2);
  };

  /* ================= STEP 3 ================= */
  const toggleInstance = (instance) => {
    const exists = selectedInstances.find(i => i._id === instance._id);

    if (exists) {
      setSelectedInstances(prev =>
        prev.filter(i => i._id !== instance._id)
      );
    } else {
      setSelectedInstances(prev => [...prev, instance]);
    }
  };

  /* ================= STEP 4 ================= */
  const handleDepartment = async (depId) => {
    setAssignmentData(prev => ({ ...prev, department: depId }));

    const res = await getEmployeesByDepartment(depId);
    setEmployees(res.data || []);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!selectedInstances.length) {
      return Swal.fire("Select at least one instance");
    }

    const payload = selectedInstances.map(inst => ({
      assetId: selectedAsset._id,
      assetType: selectedAsset.assetType,
      assetInstanceId: inst._id,
      departmentId: assignmentData.department,
      employeeId: assignmentData.employee,
      locationId: assignmentData.location,
      deviceInfo: {
        deviceName: assignmentData.deviceName,
        assetTag: assignmentData.deviceTag
      },
      quantity: 1
    }));

    try {
      setLoading(true);

      await assignAssetsFromStock({
        assignments: payload
      });

      Swal.fire("Success", "Instances assigned successfully", "success");

      resetAll();
    } catch (err) {
      Swal.fire("Error", err.message || "Assignment failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStep(0);
    setSelectedCategory(null);
    setSelectedAsset(null);
    setSelectedInstances([]);
    setAssignmentData({
      department: "",
      employee: "",
      location: "",
      deviceName: "",
      deviceTag: ""
    });
  };

  /* ================= UI ================= */
  return (
    <div className="assignment-layout">

      {/* ===== SIDEBAR STEPS ===== */}
      <div className="assignment-sidebar">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`step-item ${step === i ? "active" : ""}`}
          >
            <span>{i + 1}</span>
            <p>{s}</p>
          </div>
        ))}
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="assignment-content">

        {/* STEP 1 */}
        {step === 0 && (
          <div className="grid">
            {categories.map(cat => (
              <div
                key={cat.category}
                className="card"
                onClick={() => selectCategory(cat)}
              >
                <h3>{cat.categoryName}</h3>
                <p>{cat.totalInStock} available</p>
              </div>
            ))}
          </div>
        )}

        {/* STEP 2 */}
        {step === 1 && (
          <>
            <div className="filter-bar">
              <button onClick={() => setAssetTypeFilter("all")}>All</button>
              <button onClick={() => setAssetTypeFilter("hardware")}>Hardware</button>
              <button onClick={() => setAssetTypeFilter("software")}>Software</button>
            </div>

            <div className="grid">
              {filteredAssets.map(asset => (
                <div
                  key={asset._id}
                  className="card"
                  onClick={() => selectAsset(asset)}
                >
                  <h3>{asset.name}</h3>
                  <p>{asset.available} available</p>
                  <span>{asset.assetType}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STEP 3 - INSTANCES */}
        {step === 2 && (
          <div className="instance-grid">
            {instances.length === 0 && <p>No instances available</p>}

            {instances.map(inst => (
              <div
                key={inst._id}
                className={`instance-card ${
                  selectedInstances.find(i => i._id === inst._id)
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleInstance(inst)}
              >
                <h4>{inst.instanceCode}</h4>
                <p>{inst.uniqueIdentifier}</p>
                <span>{inst.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* STEP 4 - ASSIGN */}
        {step === 3 && (
          <div className="form-grid">

            <select onChange={(e) => handleDepartment(e.target.value)}>
              <option>Select Department</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>

            <select
              onChange={(e) =>
                setAssignmentData(p => ({ ...p, employee: e.target.value }))
              }
            >
              <option>Select Employee</option>
              {employees.map(e => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Location ID"
              onChange={(e) =>
                setAssignmentData(p => ({ ...p, location: e.target.value }))
              }
            />

            <input
              placeholder="Device Name"
              onChange={(e) =>
                setAssignmentData(p => ({ ...p, deviceName: e.target.value }))
              }
            />

            <input
              placeholder="Asset Tag"
              onChange={(e) =>
                setAssignmentData(p => ({ ...p, deviceTag: e.target.value }))
              }
            />
          </div>
        )}

        {/* STEP 5 - REVIEW */}
        {step === 4 && (
          <div className="review-box">
            <h3>Review Assignment</h3>

            <p>Asset: {selectedAsset?.name}</p>
            <p>Instances: {selectedInstances.length}</p>
            <p>Department: {assignmentData.department}</p>
            <p>Employee: {assignmentData.employee}</p>

            <button onClick={handleSubmit} disabled={loading}>
              {loading ? "Assigning..." : "Confirm Assignment"}
            </button>
          </div>
        )}

        {/* FOOTER */}
        <div className="footer">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}>Back</button>
          )}

          {step < 4 && (
            <button onClick={() => setStep(step + 1)}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;