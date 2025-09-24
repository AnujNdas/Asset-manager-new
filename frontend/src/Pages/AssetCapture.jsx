import React, { useState } from "react";
import HardwareAssetCapture from "../Inner_sections/HardwareAssetCapture";
import SoftwareAssetCapture from "../Inner_sections/SoftwareAssetCapture";
import CoreCompanyLicenseCapture from "../Inner_sections/CoreCompanyLicenseCapture";
import BulkUpload from "../Components/BulkUpload";
import "../Page_styles/Tabs.css";

const AssetCapture = () => {
  const [activeTab, setActiveTab] = useState("hardware");

  return (
    <div className="capture-container">
      <h2>Asset Capture</h2>

      {/* Tabs */}
<div className="tabs">
        {/* Capture Tabs */}
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
          className={activeTab === "core" ? "tab active" : "tab"}
          onClick={() => setActiveTab("core")}
        >
          <span className="tab-text2">Core License</span>
        </button>

        {/* Bulk Upload Tabs */}
        <button
          className={activeTab === "bulk-hardware" ? "tab active" : "tab"}
          onClick={() => setActiveTab("bulk-hardware")}
        >
          <span className="tab-text2">Bulk Hardware</span>
        </button>
        <button
          className={activeTab === "bulk-software" ? "tab active" : "tab"}
          onClick={() => setActiveTab("bulk-software")}
        >
          <span className="tab-text2">Bulk Software</span>
        </button>
        <button
          className={activeTab === "bulk-core" ? "tab active" : "tab"}
          onClick={() => setActiveTab("bulk-core")}
        >
          <span className="tab-text2">Bulk Core License</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Capture Forms */}
        {activeTab === "hardware" && <HardwareAssetCapture />}
        {activeTab === "software" && <SoftwareAssetCapture />}
        {activeTab === "core" && <CoreCompanyLicenseCapture />}

        {/* Bulk Uploads */}
        {activeTab === "bulk-hardware" && <BulkUpload type="hardware" />}
        {activeTab === "bulk-software" && <BulkUpload type="software" />}
        {activeTab === "bulk-core" && <BulkUpload type="core-license" />}
      </div>
    </div>
  );
};

export default AssetCapture;
