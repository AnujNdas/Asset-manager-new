import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import "../Page_styles/TestClassificationFile.css";
import {
  FiDownload,
  FiChevronDown,
  FiFileText,
  FiGrid,
  FiLayers,
  FiMapPin,
  FiBox,
  FiActivity,
  FiUsers,
} from "react-icons/fi";
import React, { useState, lazy, Suspense } from "react";
import Loader from "../Components/Loader";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  getUnits,
  getLocations,
  getCategories,
  getStatuses,
  getDepartments,
} from "../Services/ApiServices";

const Unit = lazy(() => import("../Inner_sections/Unit"));
const Category = lazy(() => import("../Inner_sections/Category"));
const Location = lazy(() => import("../Inner_sections/Location"));
const Status = lazy(() => import("../Inner_sections/Status"));
const Department = lazy(() => import("../Inner_sections/Department"));

const tabs = [
  { name: "Location", key: "location", path: "/classification/location" },
  { name: "Unit", key: "unit", path: "/classification/unit" },
  { name: "Category", key: "category", path: "/classification/category" },
  { name: "Department", key: "department", path: "/classification/department" },
  // { name: "Status", key: "status", path: "/classification/status" },
];
const getArrayFromResponse = (res) => {
  if (Array.isArray(res)) return res;

  if (Array.isArray(res?.data)) return res.data;

  if (Array.isArray(res?.data?.data)) return res.data.data;

  if (Array.isArray(res?.locations)) return res.locations;
  if (Array.isArray(res?.units)) return res.units;
  if (Array.isArray(res?.categories)) return res.categories;
  if (Array.isArray(res?.departments)) return res.departments;
  if (Array.isArray(res?.statuses)) return res.statuses;

  console.error("Unknown API response:", res);
  return [];
};
const preloadMap = {
  location: () => import("../Inner_sections/Location"),
  unit: () => import("../Inner_sections/Unit"),
  category: () => import("../Inner_sections/Category"),
  department: () => import("../Inner_sections/Department"),
  status: () => import("../Inner_sections/Status"),
};
const Classification = () => {
  const location = useLocation();
  const [exportOpen, setExportOpen] = useState(false);
  React.useEffect(() => {
    import("../Inner_sections/Location");
  }, []);
  // Determine active tab key
  const activeTab =
    tabs.find((t) => location.pathname.includes(t.key)) || tabs[0];
  // EXPORT HANDLER
  const handleExport = async (format) => {
    try {
      let data = [];
      let fileName = "";

      // Fetch only the active tab's data
switch (activeTab.key) {
  case "location": {
    const res = await getLocations();
    data = getArrayFromResponse(res);
    fileName = "locations";
    break;
  }

  case "unit": {
    const res = await getUnits();
    data = getArrayFromResponse(res);
    fileName = "units";
    break;
  }

  case "category": {
    const res = await getCategories();
    data = getArrayFromResponse(res);
    fileName = "categories";
    break;
  }

  case "department": {
    const res = await getDepartments();
    data = getArrayFromResponse(res);
    fileName = "departments";
    break;
  }

  case "status": {
    const res = await getStatuses();
    data = getArrayFromResponse(res);
    fileName = "statuses";
    break;
  }

  default:
    return Swal.fire("Error", "Unknown tab selected!", "error");
}

      // Export based on selected format
      if (format === "csv") {
        exportCSV(data, fileName);
      } else if (format === "excel") {
        exportExcel(data, fileName);
      }

      setExportOpen(false);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to export data!", "error");
    }
  };

  // CSV EXPORT
const exportExcel = (rows, fileName) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return Swal.fire("Empty", "No data to export!", "warning");
  }

  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, fileName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

const exportCSV = (rows, fileName) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return Swal.fire("Empty", "No data to export!", "warning");
  }

  const headers = Object.keys(rows[0]).join(",");
  const csvRows = rows.map((row) => Object.values(row).join(",")).join("\n");

  const csv = `${headers}\n${csvRows}`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;
  link.click();
};

  return (
 
<div className="classification_container">

  {/* =====================================================
      PAGE HEADER
  ===================================================== */}

  <div className="classification_header">

    <div className="classification_header_info">

      <span className="classification_eyebrow">
        ASSET CONFIGURATION
      </span>

      <h2 className="classify_heading2">
        Classification
      </h2>

      <p className="classification_subtitle">
        Manage asset categories, locations, units,
        statuses, and departments.
      </p>

    </div>


    {/* =====================================================
        EXPORT DROPDOWN
    ===================================================== */}

    <div className="export-wrapper">

      <button
        type="button"
        className="export-btn classification_export_btn"
        onClick={() => setExportOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={exportOpen}
      >

        <FiDownload />

        <span>Export Data</span>

        <FiChevronDown
          className={`classification_export_caret ${
            exportOpen ? "open" : ""
          }`}
        />

      </button>


      {exportOpen && (

        <div className="export-dropdown classification_export_dropdown">

          <div className="classification_export_label">
            EXPORT FORMAT
          </div>


          <button
            type="button"
            className="classification_export_option"
            onClick={() => {
              handleExport("csv");
              setExportOpen(false);
            }}
          >

            <span className="classification_export_option_icon">
              <FiFileText />
            </span>

            <span className="classification_export_option_text">
              <strong>Export as CSV</strong>
              <small>Comma-separated file</small>
            </span>

          </button>


          <button
            type="button"
            className="classification_export_option"
            onClick={() => {
              handleExport("excel");
              setExportOpen(false);
            }}
          >

            <span className="classification_export_option_icon">
              <FiGrid />
            </span>

            <span className="classification_export_option_text">
              <strong>Export as Excel</strong>
              <small>Excel spreadsheet</small>
            </span>

          </button>

        </div>

      )}

    </div>

  </div>


  {/* =====================================================
      CLASSIFICATION NAVIGATION
  ===================================================== */}

  <div className="classification_navigation">

    <div className="classification_navigation_header">

      <div className="classification_navigation_title">

        <FiLayers />

        <span>Classification Modules</span>

      </div>

      <span className="classification_module_count">
        {tabs.length} Modules
      </span>

    </div>


    <div className="tabs_container">

      {tabs.map((tab) => {

        const isActive =
          location.pathname === tab.path;

        const tabIcons = {
          location: FiMapPin,
          unit: FiBox,
          category: FiGrid,
          status: FiActivity,
          department: FiUsers,
        };

        const TabIcon =
          tabIcons[tab.key] || FiLayers;

        return (

          <Link
            key={tab.name}
            to={tab.path}
            onMouseEnter={preloadMap[tab.key]}
            className={`tab classification_tab ${
              isActive ? "active" : ""
            }`}
            aria-current={isActive ? "page" : undefined}
          >

            <TabIcon className="classification_tab_icon" />

            <span className="tab-text2">
              {tab.name}
            </span>

            {isActive && (
              <span className="classification_tab_indicator" />
            )}

          </Link>

        );

      })}

    </div>

  </div>


  {/* =====================================================
      CLASSIFICATION CONTENT
  ===================================================== */}

  <div className="classify_items">

    <Routes>

      <Route
        path="/"
        element={<Navigate to="location" replace />}
      />


      <Route
        path="/location"
        element={
          <Suspense fallback={<Loader />}>
            <Location />
          </Suspense>
        }
      />


      <Route
        path="/unit"
        element={
          <Suspense fallback={<Loader />}>
            <Unit />
          </Suspense>
        }
      />


      <Route
        path="/category"
        element={
          <Suspense fallback={<Loader />}>
            <Category />
          </Suspense>
        }
      />


      <Route
        path="/status"
        element={
          <Suspense fallback={<Loader />}>
            <Status />
          </Suspense>
        }
      />


      <Route
        path="/department"
        element={
          <Suspense fallback={<Loader />}>
            <Department />
          </Suspense>
        }
      />

    </Routes>

  </div>

</div>

  );
};

export default Classification;
