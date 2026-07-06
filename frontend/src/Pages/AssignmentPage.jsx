// ✅ src/Pages/AssignmentPage.jsx
import React, { useEffect, useState } from "react";
import ThemeSwal from "../utils/swalTheme";
import "../Page_styles/AssignmentPage.css";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";
import {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  assignAssetsFromStock,
  getDepartments,
  getEmployeesByDepartment,
  getInstancesByAsset
} from "../Services/ApiServices";
import Pagination from "../Components/Pagination";
import Loader from "../Components/Loader";
import { useLocation } from "react-router-dom";
import { getErrorMessage } from "../utils/getErrorMessage";
    import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTour } from "../Context/TourContext";
import { useNavigate } from "react-router-dom";

const steps = [
  "Category",
  "Assets",
  "Instances",
  "Assignment",
  "Review"
];

const AssignmentPage = () => {
  const navigate = useNavigate();
  const { registerTour } = useTour();
  const { currency, convertFromBase, loadingRates } = useCurrency();
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
  const [initializing, setInitializing] = useState(true);
  const [assetTypeFilter, setAssetTypeFilter] = useState("all");
  // 🔹 Step 2 (Assets)
const [assetPage, setAssetPage] = useState(1);
const assetsPerPage = 8;
const location = useLocation();

const preselectedCategory = location.state?.category;
const preselectedAssetId = location.state?.assetId;
const preselectedAssetType = location.state?.assetType;
// 🔹 Step 3 (Instances)
const [instancePage, setInstancePage] = useState(1);
const instancesPerPage = 10;
const [assignmentData, setAssignmentData] = useState({
  department: "",
  employee: "",
  location: "",
  assignmentDate: new Date().toISOString().split("T")[0],
  deviceName: "",
  serialNumber: "",   // ✅ NEW
  model: ""           // ✅ NEW
});

  const [loading, setLoading] = useState(false);
  const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  /* ================= LOAD ================= */
useEffect(() => {
  const init = async () => {
    try {
      setInitializing(true);

      await fetchDepartments();

      // ✅ DIRECT NAVIGATION FLOW
      if (preselectedCategory && preselectedAssetId) {

        const res = await getInStockAssetsByCategory(
          preselectedCategory
        );

        const assetList = res.data || [];

        setAssets(assetList);
        setFilteredAssets(assetList);

        const foundAsset = assetList.find(
          a => a._id === preselectedAssetId
        );

if (foundAsset) {

  const categoryObj =
    foundAsset.assetCategory ||
    foundAsset.category;

  setSelectedCategory({
    category:
      categoryObj?._id ||
      preselectedCategory,

    categoryName:
      categoryObj?.name ||
      categoryObj?.categoryName ||
      "Unknown Category",
  });

  setSelectedAsset(foundAsset);

  const instanceRes =
    await getInstancesByAsset(foundAsset._id);

  setInstances(instanceRes.data || []);

  setStep(2);

} else {
          setStep(1);
        }

      } else {
        // ✅ NORMAL FLOW
        await fetchCategories();
      }

    } catch (err) {
      console.error(err);
    } finally {
      setInitializing(false);
    }
  };

  init();
}, []);
  useEffect(() => {
  setAssetPage(1);
}, [filteredAssets]);

useEffect(() => {
  setInstancePage(1);
}, [instances]);
  const fetchCategories = async () => {
    const res = await getInStockCategorySummary();
    setCategories(res.data || []);
  };

  const fetchDepartments = async () => {
    const res = await getDepartments();
    setDepartments(res.data || res || []);
  };

  /* ================= Tour guide ================= */


  /* ================= STEP 1 ================= */
  const selectCategory = async (cat) => {
    setSelectedCategory(cat);
    const res = await getInStockAssetsByCategory(cat.category);
    console.log(res)
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
const assetIndexLast = assetPage * assetsPerPage;
const paginatedAssets = filteredAssets.slice(
  assetIndexLast - assetsPerPage,
  assetIndexLast
);

const totalAssetPages = Math.ceil(filteredAssets.length / assetsPerPage);
const selectAsset = async (asset) => {
  setSelectedAsset(asset);
  
  const isSoftware = asset.assetType === "software";

  // ✅ RESET DEVICE INFO IF HARDWARE
  if (!isSoftware) {
    setAssignmentData(prev => ({
      ...prev,
      deviceName: "",
      serialNumber: "",
      model: ""
    }));
  }
  try {
    const res = await getInstancesByAsset(asset._id);
    setInstances(res.data || []);
    console.log(res)
  } catch (err) {
  ThemeSwal.fire("Error", getErrorMessage(err, "Failed to load instances"), "error");
}

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
  const instanceIndexLast = instancePage * instancesPerPage;

const paginatedInstances = instances.slice(
  instanceIndexLast - instancesPerPage,
  instanceIndexLast
);

const totalInstancePages = Math.ceil(
  instances.length / instancesPerPage
);
  /* ================= STEP 4 ================= */
  const handleDepartment = async (depId) => {
    setAssignmentData(prev => ({ ...prev, department: depId }));

    const res = await getEmployeesByDepartment(depId);
    setEmployees(res.data || []);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!selectedInstances.length) {
      return ThemeSwal.fire("Select at least one instance");
    }
const isSoftware = selectedAsset?.assetType === "software";

if (isSoftware) {
  if (!assignmentData.deviceName || !assignmentData.serialNumber) {
    return ThemeSwal.fire(
      "Error",
      "Device info required for software",
      "error"
    );
  }
}
const payload = selectedInstances.map((inst) => ({
  assetId: selectedAsset._id,
  assetType: selectedAsset.assetType,
  assetInstanceId: inst._id,
  departmentId: assignmentData.department,
  employeeId: assignmentData.employee,
  location: assignmentData.location,

  assignmentDate: assignmentData.assignmentDate,

  ...(isSoftware && {
    deviceInfo: {
      deviceName: assignmentData.deviceName,
      serialNumber: assignmentData.serialNumber,
      model: assignmentData.model,
    },
  }),
}));

    try {
      setLoading(true);

   await assignAssetsFromStock({
  assignments: payload
});

ThemeSwal.fire(
  "Success",
  "Instances assigned successfully",
  "success"
);

navigate(
  `/inventory?tab=${selectedAsset.assetType}&highlight=${selectedAsset._id}`
);
      resetAll();
    }catch (err) {
  ThemeSwal.fire("Error", getErrorMessage(err, "Assignment failed"), "error");
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
  assignmentDate: new Date().toISOString().split("T")[0],

  deviceName: "",
  serialNumber: "",
  model: ""
});
  };
  if (loading) return <Loader />;
  if (initializing) {
  return <Loader />;
}
  /* ================= UI ================= */
  return (
  <div className="assignment-container">

    {/* HEADER */}
    <div className="assignment-header">
      <h2>Asset Assignment</h2>
      <p>Assign asset instances to employees</p>
    </div>

    {/* STEPS */}
    <div className="steps tour-step">
      {steps.map((s, i) => (
        <div key={i} className={`step ${step === i ? "active" : ""}`}>
          {i + 1}. {s}
        </div>
      ))}
    </div>

    {/* CONTENT */}
    <div className="content">

      {/* STEP 1 */}
      {step === 0 && (
        <div className="grid">
          {categories.map(cat => (
            <div key={cat.category} className="card tour-info" onClick={() => selectCategory(cat)}>
              <h3>{cat.categoryName}</h3>
              <p>{cat.totalInStock} available</p>
            </div>
          ))}
        </div>
      )}

      {/* STEP 2 */}
      {step === 1 && (
        <>
          <div className="filter">
            <button onClick={() => setAssetTypeFilter("all")} className={assetTypeFilter === "all" ? "active" : ""}>All</button>
            <button onClick={() => setAssetTypeFilter("hardware")} className={assetTypeFilter === "hardware" ? "active" : ""}>Hardware</button>
            <button onClick={() => setAssetTypeFilter("software")} className={assetTypeFilter === "software" ? "active" : ""}>Software</button>
          </div>

          <div className="grid">
            {paginatedAssets.map(asset => (
              <div key={asset._id} className="card" onClick={() => selectAsset(asset)}>
                <h3>{asset.name}</h3>
                <p>{asset.available} available</p>
                <span>{capitalize(asset.assetType)}</span>
              </div>
            ))}
          </div>
          <Pagination
  currentPage={assetPage}
  totalPages={totalAssetPages}
  onPageChange={setAssetPage}
/>
        </>
      )}

      {/* STEP 3 */}
      {step === 2 && (
        <>
<div className="instance-grid">
  {instances.length === 0 ? (
    <p>No instances found</p>
  ) : (
    paginatedInstances.map(inst => {
const costObj =
  inst.assetType === "hardware"
    ? inst.hardware?.purchaseCost
    : inst.software?.purchaseCost;

const cost = costObj?.amount || 0;
const currencyCode = costObj?.currency || "USD";

      return (
        <div
          key={inst._id}
          className={`instance ${
            selectedInstances.some(i => i._id === inst._id) ? "selected" : ""
          }`}
          onClick={() => toggleInstance(inst)}
        >
          <h4>{inst.deviceName || "Unnamed Device"}</h4>
          <p>{inst.instanceCode}</p>

          {/* ✅ COST DISPLAY */}
  <p className="instance-cost">
    💰 {cost} {CURRENCY_SYMBOLS[currencyCode] || currencyCode}
  </p>

  <p className="instance-location">
    📍 {inst.location || "No Location"}
  </p>
          <span>{capitalize(inst.status)}</span>
        </div>
      );
    })
  )}
</div>
<Pagination
  currentPage={instancePage}
  totalPages={totalInstancePages}
  onPageChange={setInstancePage}
/>
</>
      )}

      {/* STEP 4 */}
      {step === 3 && (
        <div className="form">
          <select onChange={(e) => handleDepartment(e.target.value)}>
            <option>Select Department</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>

          <select onChange={(e) =>
            setAssignmentData(p => ({ ...p, employee: e.target.value }))
          }>
            <option>Select Employee</option>
            {employees.map(e => (
              <option key={e._id} value={e._id}>{e.name}</option>
            ))}
          </select>

          <input placeholder="Assign Location"
            onChange={(e) => setAssignmentData(p => ({ ...p, location: e.target.value }))} />

            <input
  type="date"
  value={assignmentData.assignmentDate}
  onChange={(e) =>
    setAssignmentData((p) => ({
      ...p,
      assignmentDate: e.target.value,
    }))
  }
/>

{selectedAsset?.assetType === "software" && (
  <>
    <input
      placeholder="Device Name"
      value={assignmentData.deviceName}
      onChange={(e) =>
        setAssignmentData(p => ({ ...p, deviceName: e.target.value }))
      }
    />

    <input
      placeholder="Serial Number"
      value={assignmentData.serialNumber}
      onChange={(e) =>
        setAssignmentData(p => ({ ...p, serialNumber: e.target.value }))
      }
    />

    <input
      placeholder="Model"
      value={assignmentData.model}
      onChange={(e) =>
        setAssignmentData(p => ({ ...p, model: e.target.value }))
      }
    />
  </>
)}
        </div>
      )}

      {/* STEP 5 */}
{/* STEP 5 */}
{step === 4 && (() => {

  const selectedDepartment = departments.find(
    d => d._id === assignmentData.department
  );

  const selectedEmployee = employees.find(
    e => e._id === assignmentData.employee
  );

  return (
<div className="review">

  <div className="review-header">
    <h3>Review Assignment</h3>
    <span className="review-badge">Final Step</span>
  </div>

  {/* CATEGORY */}
  <div className="review-card">
    <h4>Category</h4>
    <p><strong>Category:</strong> {selectedCategory?.categoryName || "-"}</p>
  </div>

  {/* ASSET */}
  <div className="review-card">
    <h4>Asset Information</h4>

    <div className="review-grid">
      <div>
        <span>Asset :- </span>
        <p>{selectedAsset?.name || "-"}</p>
      </div>

      <div>
        <span>Asset Type :- </span>
        <p>{capitalize(selectedAsset?.assetType) || "-"}</p>
      </div>
    </div>
  </div>

  {/* INSTANCES */}
  <div className="review-card">
    <h4>
      Selected Instances
      <span className="instance-count">
        {selectedInstances.length}
      </span>
    </h4>

    <div className="review-instance-list">
      {selectedInstances.map((inst) => (
        <div
          key={inst._id}
          className="review-instance-item"
        >
          <span>Device</span>
          <strong>{inst.deviceName}</strong>
        </div>
      ))}
    </div>
  </div>

  {/* ASSIGNMENT */}
  <div className="review-card">
    <h4>Assignment Details</h4>

    <div className="review-grid">

      <div>
        <span>Department</span>
        <p>{selectedDepartment?.name || "-"}</p>
      </div>

      <div>
        <span>Employee</span>
        <p>{selectedEmployee?.name || "-"}</p>
      </div>

      <div>
        <span>Location</span>
        <p>{capitalize(assignmentData.location) || "-"}</p>
      </div>

      <div>
        <span>Assignment Date</span>
        <p>{assignmentData.assignmentDate || "-"}</p>
      </div>

    </div>
  </div>

  {selectedAsset?.assetType === "software" && (
    <div className="review-card">

      <h4>Device Information</h4>

      <div className="review-grid">

        <div>
          <span>Device Name</span>
          <p>{assignmentData.deviceName || "-"}</p>
        </div>

        <div>
          <span>Serial Number</span>
          <p>{assignmentData.serialNumber || "-"}</p>
        </div>

        <div>
          <span>Model</span>
          <p>{assignmentData.model || "-"}</p>
        </div>

      </div>

    </div>
  )}

  <button className="review-submit" onClick={handleSubmit}>
    {loading ? "Assigning..." : "Confirm Assignment"}
  </button>

</div>
  );

})()}

    </div>

    {/* FOOTER */}
    <div className="footer2">
      {step > 0 && <button onClick={() => setStep(step - 1)} className="tour-back">Back</button>}
      {step < 4 && <button onClick={() => setStep(step + 1)} className="tour-next">Next</button>}
    </div>

  </div>
);
};

export default AssignmentPage;