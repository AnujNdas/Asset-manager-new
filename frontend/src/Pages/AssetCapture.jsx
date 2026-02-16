import React, { useState } from "react";
import HardwareAssetCapture from "../Inner_sections/HardwareAssetCapture";
import SoftwareAssetCapture from "../Inner_sections/SoftwareAssetCapture";
import CoreCompanyLicenseCapture from "../Inner_sections/CoreCompanyLicenseCapture";
import BulkUpload from "../Components/BulkUpload";
import "../Page_styles/Tabs.css";
import {jwtDecode} from "jwt-decode";

const AssetCapture = () => {
  const [activeTab, setActiveTab] = useState("hardware");
  const [importType, setImportType] = useState("hardware");


const token = localStorage.getItem("auth");

let userRole = "user";

if (token) {
  try {
    const decoded = jwtDecode(token);
    userRole = decoded.role;
  } catch (err) {
    console.error("Invalid token");
  }
}

  return (
    <div className="capture-container">
      {/* <h2 className="classify_heading">Asset Capture</h2> */}

      {/* Tabs */}
      <div className="tabs">

        <button
          className={activeTab === "hardware" ? "tab active" : "tab"}
          onClick={() => setActiveTab("hardware")}
        >
          <span className="tab-text2">Hardware</span>
        </button>

        <button
          className={activeTab === "software" ? "tab active" : "tab"}
          onClick={() => setActiveTab("software")}
        >
          <span className="tab-text2">Software</span>
        </button>

        <button
          className={activeTab === "import" ? "tab active" : "tab"}
          onClick={() => setActiveTab("import")}
        >
          <span className="tab-text2">Import</span> {/* Only one import tab */}
        </button>

      </div>

      {/* CONTENT SECTION */}
      <div className="tab-content">

        {activeTab === "hardware" && <HardwareAssetCapture />}
        {activeTab === "software" && <SoftwareAssetCapture />}

        {/* ----- IMPORT SECTION ----- */}
        {activeTab === "import" && (
          <div className="import-container">
            <label className="import-label">Select Import Type:</label>

            <select
              className="import-select"
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
            >
              <option value="hardware">Hardware Assets</option>
              <option value="software">Software Assets</option>
            </select>

            {/* Dynamic bulk upload */}
            <BulkUpload type={importType} userRole={userRole} />

          </div>
        )}

      </div>
    </div>
  );
};

export default AssetCapture;
