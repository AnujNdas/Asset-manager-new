// ✅ src/Pages/AssignmentPage.jsx
import React, { useEffect, useState } from "react";
import {
  FiCheck,
  FiCheckCircle,
  FiGrid,
  FiArrowUpRight,
  FiPackage,
  FiInbox,
  FiHardDrive,
  FiDollarSign,
  FiMapPin,
  FiUsers,
  FiMonitor,
  FiInfo,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
import ThemeSwal from "../utils/swalTheme";
import "../Page_styles/TestAssignmentFile.css";
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

  {/* ================= PAGE HEADER ================= */}

  <div className="assignment-header">

    <div className="assignment-header-info">
      <span className="assignment-eyebrow">
        ASSET MANAGEMENT
      </span>

      <h2>Asset Assignment</h2>

      <p>
        Assign available asset instances to employees
        and manage allocation details.
      </p>
    </div>

    <div className="assignment-header-counter">
      <span>Current Step</span>
      <strong>
        {String(step + 1).padStart(2, "0")}
        <small> / 05</small>
      </strong>
    </div>

  </div>


  {/* ================= PROGRESS STEPS ================= */}

  <div className="assignment-progress-wrapper tour-step">

    <div className="assignment-progress-header">
      <span>Assignment Progress</span>
      <strong>
        {Math.round(((step + 1) / steps.length) * 100)}%
      </strong>
    </div>

    <div className="assignment-progress-track">
      <div
        className="assignment-progress-fill"
        style={{
          width: `${((step + 1) / steps.length) * 100}%`,
        }}
      />
    </div>

    <div className="steps">

      {steps.map((s, i) => (

        <div
          key={i}
          className={`step ${
            step === i
              ? "active"
              : i < step
              ? "completed"
              : ""
          }`}
          aria-current={step === i ? "step" : undefined}
        >

          <span className="assignment-step-number">
            {i < step ? <FiCheck /> : i + 1}
          </span>

          <span className="assignment-step-label">
            {s}
          </span>

        </div>

      ))}

    </div>

  </div>


  {/* ================= CONTENT ================= */}

  <div className="content">

    {/* =====================================================
        STEP 1 — CATEGORY SELECTION
    ===================================================== */}

    {step === 0 && (

      <div className="assignment-step-section">

        <div className="assignment-section-header">

          <div>
            <span className="assignment-section-eyebrow">
              STEP 01
            </span>

            <h3>Select Asset Category</h3>

            <p>
              Choose a category containing available assets.
            </p>
          </div>

          <span className="assignment-section-count">
            {categories.length} Categories
          </span>

        </div>


        {categories.length > 0 ? (

          <div className="grid assignment-category-grid">

            {categories.map((cat) => (

              <button
                type="button"
                key={cat.category}
                className="card assignment-category-card tour-info"
                onClick={() => selectCategory(cat)}
              >

                <div className="assignment-category-card-top">

                  <span className="assignment-category-icon">
                    <FiGrid />
                  </span>

                  <FiArrowUpRight className="assignment-card-arrow" />

                </div>

                <div className="assignment-category-info">

                  <h3>
                    {cat.categoryName}
                  </h3>

                  <div className="assignment-availability">

                    <span className="assignment-availability-dot" />

                    <strong>
                      {cat.totalInStock}
                    </strong>

                    <span>Available</span>

                  </div>

                </div>

              </button>

            ))}

          </div>

        ) : (

          <div className="assignment-empty-state">
            <FiInbox />
            <h4>No Categories Available</h4>
            <p>
              There are no categories with available
              assets at the moment.
            </p>
          </div>

        )}

      </div>

    )}


    {/* =====================================================
        STEP 2 — ASSET SELECTION
    ===================================================== */}

    {step === 1 && (

      <div className="assignment-step-section">

        <div className="assignment-section-header">

          <div>

            <span className="assignment-section-eyebrow">
              STEP 02
            </span>

            <h3>Select Asset</h3>

            <p>
              Choose an asset to view its available instances.
            </p>

          </div>

          <span className="assignment-section-count">
            {paginatedAssets.length} Shown
          </span>

        </div>


        {/* FILTER */}

        <div className="filter assignment-filter">

          {[
            { value: "all", label: "All Assets" },
            { value: "hardware", label: "Hardware" },
            { value: "software", label: "Software" },
          ].map((option) => (

            <button
              type="button"
              key={option.value}
              className={
                assetTypeFilter === option.value
                  ? "active"
                  : ""
              }
              aria-pressed={assetTypeFilter === option.value}
              onClick={() =>
                setAssetTypeFilter(option.value)
              }
            >
              {option.label}
            </button>

          ))}

        </div>


        {/* ASSET GRID */}

        {paginatedAssets.length > 0 ? (

          <div className="grid assignment-asset-grid">

            {paginatedAssets.map((asset) => (

              <button
                type="button"
                key={asset._id}
                className="card assignment-asset-card"
                onClick={() => selectAsset(asset)}
              >

                <div className="assignment-asset-card-top">

                  <span
                    className={`assignment-type-badge ${
                      asset.assetType === "hardware"
                        ? "hardware"
                        : "software"
                    }`}
                  >
                    {capitalize(asset.assetType)}
                  </span>

                  <FiArrowUpRight className="assignment-card-arrow" />

                </div>


                <div className="assignment-asset-info">

                  <h3>
                    {asset.name}
                  </h3>

                  <div className="assignment-asset-availability">

                    <FiPackage />

                    <strong>{asset.available}</strong>

                    <span>Instances Available</span>

                  </div>

                </div>

              </button>

            ))}

          </div>

        ) : (

          <div className="assignment-empty-state">
            <FiPackage />
            <h4>No Assets Found</h4>
            <p>
              No available assets match the selected filter.
            </p>
          </div>

        )}


        <div className="assignment-pagination">
          <Pagination
            currentPage={assetPage}
            totalPages={totalAssetPages}
            onPageChange={setAssetPage}
          />
        </div>

      </div>

    )}


    {/* =====================================================
        STEP 3 — INSTANCE SELECTION
    ===================================================== */}

    {step === 2 && (

      <div className="assignment-step-section">

        <div className="assignment-section-header">

          <div>

            <span className="assignment-section-eyebrow">
              STEP 03
            </span>

            <h3>Select Asset Instances</h3>

            <p>
              Select one or more instances to assign.
            </p>

          </div>

          <span className="assignment-selected-count">
            <FiCheckCircle />
            {selectedInstances.length} Selected
          </span>

        </div>


        {/* INSTANCE GRID */}

        {instances.length === 0 ? (

          <div className="assignment-empty-state">
            <FiInbox />
            <h4>No Instances Found</h4>
            <p>
              This asset has no available instances.
            </p>
          </div>

        ) : (

          <div className="instance-grid">

            {paginatedInstances.map((inst) => {

              const isSelected =
                selectedInstances.some(
                  (i) => i._id === inst._id
                );

              const costObj =
                inst.assetType === "hardware"
                  ? inst.hardware?.purchaseCost
                  : inst.software?.purchaseCost;

              const cost = costObj?.amount || 0;

              const currencyCode =
                costObj?.currency || "USD";

              return (

                <button
                  type="button"
                  key={inst._id}
                  className={`instance ${
                    isSelected ? "selected" : ""
                  }`}
                  aria-pressed={isSelected}
                  onClick={() => toggleInstance(inst)}
                >

                  <div className="assignment-instance-top">

                    <span className="assignment-instance-icon">
                      <FiHardDrive />
                    </span>

                    <span
                      className={`assignment-instance-checkbox ${
                        isSelected ? "checked" : ""
                      }`}
                    >
                      {isSelected && <FiCheck />}
                    </span>

                  </div>


                  <div className="assignment-instance-info">

                    <h4>
                      {inst.deviceName || "Unnamed Device"}
                    </h4>

                    <p className="assignment-instance-code">
                      {inst.instanceCode}
                    </p>

                  </div>


                  <div className="assignment-instance-meta">

                    <div className="assignment-instance-meta-row">

                      <FiDollarSign />

                      <span>
                        {CURRENCY_SYMBOLS[currencyCode] ||
                          currencyCode}
                        {Number(cost).toLocaleString()}
                      </span>

                    </div>

                    <div className="assignment-instance-meta-row">

                      <FiMapPin />

                      <span>
                        {inst.location || "No Location"}
                      </span>

                    </div>

                  </div>


                  <div className="assignment-instance-footer">

                    <span className="assignment-instance-status">
                      <span className="assignment-status-dot" />
                      {capitalize(inst.status)}
                    </span>

                    <span className="assignment-instance-select-text">
                      {isSelected ? "Selected" : "Select Instance"}
                    </span>

                  </div>

                </button>

              );

            })}

          </div>

        )}


        <div className="assignment-pagination">
          <Pagination
            currentPage={instancePage}
            totalPages={totalInstancePages}
            onPageChange={setInstancePage}
          />
        </div>

      </div>

    )}


    {/* =====================================================
        STEP 4 — ASSIGNMENT FORM
    ===================================================== */}

    {step === 3 && (

      <div className="assignment-step-section">

        <div className="assignment-section-header">

          <div>

            <span className="assignment-section-eyebrow">
              STEP 04
            </span>

            <h3>Assignment Details</h3>

            <p>
              Enter employee, department and allocation information.
            </p>

          </div>

        </div>


        <div className="form assignment-form">

          {/* EMPLOYEE ASSIGNMENT */}

          <div className="assignment-form-card">

            <div className="assignment-form-card-header">

              <span className="assignment-form-card-icon">
                <FiUsers />
              </span>

              <div>
                <h4>Employee Assignment</h4>
                <p>Select the receiving department and employee.</p>
              </div>

            </div>


            <div className="assignment-form-grid">

              <div className="assignment-form-field">

                <label htmlFor="assignment-department">
                  Department
                </label>

                <select
                  id="assignment-department"
                  value={assignmentData.department || ""}
                  onChange={(e) =>
                    handleDepartment(e.target.value)
                  }
                >
                  <option value="">
                    Select Department
                  </option>

                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>

              </div>


              <div className="assignment-form-field">

                <label htmlFor="assignment-employee">
                  Employee
                </label>

                <select
                  id="assignment-employee"
                  value={assignmentData.employee || ""}
                  onChange={(e) =>
                    setAssignmentData((p) => ({
                      ...p,
                      employee: e.target.value,
                    }))
                  }
                >
                  <option value="">
                    Select Employee
                  </option>

                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.name}
                    </option>
                  ))}
                </select>

              </div>

            </div>

          </div>


          {/* LOCATION AND DATE */}

          <div className="assignment-form-card">

            <div className="assignment-form-card-header">

              <span className="assignment-form-card-icon">
                <FiMapPin />
              </span>

              <div>
                <h4>Allocation Information</h4>
                <p>Specify the assignment location and date.</p>
              </div>

            </div>


            <div className="assignment-form-grid">

              <div className="assignment-form-field">

                <label htmlFor="assignment-location">
                  Assignment Location
                </label>

                <input
                  id="assignment-location"
                  type="text"
                  placeholder="Enter assignment location"
                  value={assignmentData.location || ""}
                  onChange={(e) =>
                    setAssignmentData((p) => ({
                      ...p,
                      location: e.target.value,
                    }))
                  }
                />

              </div>


              <div className="assignment-form-field">

                <label htmlFor="assignment-date">
                  Assignment Date
                </label>

                <input
                  id="assignment-date"
                  type="date"
                  value={assignmentData.assignmentDate || ""}
                  onChange={(e) =>
                    setAssignmentData((p) => ({
                      ...p,
                      assignmentDate: e.target.value,
                    }))
                  }
                />

              </div>

            </div>

          </div>


          {/* SOFTWARE DEVICE INFORMATION */}

          {selectedAsset?.assetType === "software" && (

            <div className="assignment-form-card">

              <div className="assignment-form-card-header">

                <span className="assignment-form-card-icon">
                  <FiMonitor />
                </span>

                <div>
                  <h4>Device Information</h4>
                  <p>
                    Provide the device details associated
                    with this software assignment.
                  </p>
                </div>

              </div>


              <div className="assignment-form-grid">

                <div className="assignment-form-field">

                  <label htmlFor="assignment-device-name">
                    Device Name
                  </label>

                  <input
                    id="assignment-device-name"
                    type="text"
                    placeholder="Enter device name"
                    value={assignmentData.deviceName || ""}
                    onChange={(e) =>
                      setAssignmentData((p) => ({
                        ...p,
                        deviceName: e.target.value,
                      }))
                    }
                  />

                </div>


                <div className="assignment-form-field">

                  <label htmlFor="assignment-serial-number">
                    Serial Number
                  </label>

                  <input
                    id="assignment-serial-number"
                    type="text"
                    placeholder="Enter serial number"
                    value={assignmentData.serialNumber || ""}
                    onChange={(e) =>
                      setAssignmentData((p) => ({
                        ...p,
                        serialNumber: e.target.value,
                      }))
                    }
                  />

                </div>


                <div className="assignment-form-field">

                  <label htmlFor="assignment-model">
                    Model
                  </label>

                  <input
                    id="assignment-model"
                    type="text"
                    placeholder="Enter model"
                    value={assignmentData.model || ""}
                    onChange={(e) =>
                      setAssignmentData((p) => ({
                        ...p,
                        model: e.target.value,
                      }))
                    }
                  />

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    )}


    {/* =====================================================
        STEP 5 — REVIEW ASSIGNMENT
    ===================================================== */}

    {step === 4 && (() => {

      const selectedDepartment = departments.find(
        (d) => d._id === assignmentData.department
      );

      const selectedEmployee = employees.find(
        (e) => e._id === assignmentData.employee
      );

      return (

        <div className="review assignment-review">

          <div className="review-header">

            <div>

              <span className="assignment-section-eyebrow">
                STEP 05
              </span>

              <h3>Review Assignment</h3>

              <p>
                Verify the information before confirming
                the asset assignment.
              </p>

            </div>

            <span className="review-badge">
              <FiCheckCircle />
              Final Step
            </span>

          </div>


          {/* CATEGORY */}

          <div className="review-card">

            <div className="assignment-review-card-header">
              <FiGrid />
              <h4>Category</h4>
            </div>

            <div className="review-grid">

              <div className="assignment-review-field">
                <span>Selected Category</span>
                <p>
                  {selectedCategory?.categoryName || "-"}
                </p>
              </div>

            </div>

          </div>


          {/* ASSET INFORMATION */}

          <div className="review-card">

            <div className="assignment-review-card-header">
              <FiPackage />
              <h4>Asset Information</h4>
            </div>

            <div className="review-grid">

              <div className="assignment-review-field">

                <span>Asset</span>

                <p>
                  {selectedAsset?.name || "-"}
                </p>

              </div>


              <div className="assignment-review-field">

                <span>Asset Type</span>

                <p>
                  {selectedAsset?.assetType
                    ? capitalize(selectedAsset.assetType)
                    : "-"}
                </p>

              </div>

            </div>

          </div>


          {/* SELECTED INSTANCES */}

          <div className="review-card">

            <div className="assignment-review-card-header">

              <FiHardDrive />

              <h4>Selected Instances</h4>

              <span className="instance-count">
                {selectedInstances.length}
              </span>

            </div>


            <div className="review-instance-list">

              {selectedInstances.map((inst) => {

                const purchaseCost =
                  inst.assetType === "hardware"
                    ? inst.hardware?.purchaseCost
                    : inst.software?.purchaseCost;

                const specifications =
                  selectedAsset?.assetType === "hardware"
                    ? inst.hardware?.specifications
                    : inst.software?.specifications;

                return (

                  <div
                    key={inst._id}
                    className="review-instance-card"
                  >

                    <div className="review-instance-title">

                      <div>
                        <h5>
                          {inst.deviceName || "Unnamed Device"}
                        </h5>

                        <span>
                          {inst.instanceCode}
                        </span>
                      </div>

                      <span className="assignment-review-instance-status">
                        {capitalize(inst.status)}
                      </span>

                    </div>


                    <div className="review-instance-grid">

                      <div className="review-item">

                        <label>Location</label>

                        <p>
                          {inst.location || "-"}
                        </p>

                      </div>


                      <div className="review-item">

                        <label>Specification</label>

                        <p>
                          {specifications || "-"}
                        </p>

                      </div>


                      <div className="review-item">

                        <label>Purchase Cost</label>

                        <p>
                          {purchaseCost
                            ? `${purchaseCost.currency || "USD"} ${Number(
                                purchaseCost.amount || 0
                              ).toLocaleString()}`
                            : "-"}
                        </p>

                      </div>


                      <div className="review-item">

                        <label>Status</label>

                        <p>
                          {capitalize(inst.status)}
                        </p>

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>

          </div>


          {/* ASSIGNMENT DETAILS */}

          <div className="review-card">

            <div className="assignment-review-card-header">
              <FiUsers />
              <h4>Assignment Details</h4>
            </div>

            <div className="review-grid">

              <div className="assignment-review-field">

                <span>Department</span>

                <p>
                  {selectedDepartment?.name || "-"}
                </p>

              </div>


              <div className="assignment-review-field">

                <span>Employee</span>

                <p>
                  {selectedEmployee?.name || "-"}
                </p>

              </div>


              <div className="assignment-review-field">

                <span>Location</span>

                <p>
                  {assignmentData.location
                    ? capitalize(assignmentData.location)
                    : "-"}
                </p>

              </div>


              <div className="assignment-review-field">

                <span>Assignment Date</span>

                <p>
                  {assignmentData.assignmentDate || "-"}
                </p>

              </div>

            </div>

          </div>


          {/* SOFTWARE DEVICE DETAILS */}

          {selectedAsset?.assetType === "software" && (

            <div className="review-card">

              <div className="assignment-review-card-header">
                <FiMonitor />
                <h4>Device Information</h4>
              </div>

              <div className="review-grid">

                <div className="assignment-review-field">
                  <span>Device Name</span>
                  <p>{assignmentData.deviceName || "-"}</p>
                </div>

                <div className="assignment-review-field">
                  <span>Serial Number</span>
                  <p>{assignmentData.serialNumber || "-"}</p>
                </div>

                <div className="assignment-review-field">
                  <span>Model</span>
                  <p>{assignmentData.model || "-"}</p>
                </div>

              </div>

            </div>

          )}


          {/* CONFIRM BUTTON */}

          <div className="assignment-review-actions">

            <div className="assignment-review-confirmation-text">
              <FiInfo />
              <span>
                Confirm the details to assign the selected
                instances to the employee.
              </span>
            </div>

            <button
              type="button"
              className="review-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                "Assigning..."
              ) : (
                <>
                  <FiCheckCircle />
                  Confirm Assignment
                </>
              )}
            </button>

          </div>

        </div>

      );

    })()}

  </div>


  {/* ================= FOOTER NAVIGATION ================= */}

  <div className="footer2 assignment-footer">

    <div className="assignment-footer-info">
      <span>
        Step {step + 1} of {steps.length}
      </span>
      <strong>
        {steps[step]}
      </strong>
    </div>

    <div className="assignment-footer-actions">

      {step > 0 && (

        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="tour-back assignment-back-btn"
        >
          <FiArrowLeft />
          Back
        </button>

      )}

      {step < 4 && (

        <button
          type="button"
          onClick={() => setStep(step + 1)}
          className="tour-next assignment-next-btn"
        >
          Next
          <FiArrowRight />
        </button>

      )}

    </div>

  </div>

</div>

);
};

export default AssignmentPage;