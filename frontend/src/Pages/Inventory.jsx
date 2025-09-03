import React, { useState } from "react";
import HardwareAssetList from "../Inner_sections/HardwareAssetInventory";
import SoftwareAssetList from "../Inner_sections/SoftwareAssetInventory";
import CoreCompanyLicenseList from "../Inner_sections/CoreCompanyLicenseInventory";
import "../Page_styles/Inventory.css";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("hardware");

  return (
    <div className="inventory-container">
      <h2 className="inventory-title">📦 Asset Inventory</h2>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "hardware" ? "tab active" : "tab"}
          onClick={() => setActiveTab("hardware")}
        >
          💻 Hardware
        </button>
        <button
          className={activeTab === "software" ? "tab active" : "tab"}
          onClick={() => setActiveTab("software")}
        >
          🖥️ Software
        </button>
        <button
          className={activeTab === "core" ? "tab active" : "tab"}
          onClick={() => setActiveTab("core")}
        >
          🏢 Core Licenses
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "hardware" && <HardwareAssetList />}
        {activeTab === "software" && <SoftwareAssetList />}
        {activeTab === "core" && <CoreCompanyLicenseList />}
      </div>
    </div>
  );
};

export default Inventory;
