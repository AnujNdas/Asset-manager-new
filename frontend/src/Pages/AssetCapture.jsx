import React, { useState } from "react";
import HardwareAssetCapture from "../Inner_sections/HardwareAssetCapture";
import SoftwareAssetCapture from "../Inner_sections/SoftwareAssetCapture";
import CoreCompanyLicenseCapture from "../Inner_sections/CoreCompanyLicenseCapture";
// import "../Page_styles/CaptureForm.css";
import "../Page_styles/Tabs.css"; // styling for tabs

const AssetCapture = () => {
  const [activeTab, setActiveTab] = useState("hardware");

  return (
    <div className="capture-container">
      <h2>Asset Capture</h2>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "hardware" ? "tab active" : "tab"}
          onClick={() => setActiveTab("hardware")}
        >
          Hardware
        </button>
        <button
          className={activeTab === "software" ? "tab active" : "tab"}
          onClick={() => setActiveTab("software")}
        >
          Software
        </button>
        <button
          className={activeTab === "core" ? "tab active" : "tab"}
          onClick={() => setActiveTab("core")}
        >
          Core License
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "hardware" && <HardwareAssetCapture />}
        {activeTab === "software" && <SoftwareAssetCapture />}
        {activeTab === "core" && <CoreCompanyLicenseCapture />}
      </div>
    </div>
  );
};

export default AssetCapture;
