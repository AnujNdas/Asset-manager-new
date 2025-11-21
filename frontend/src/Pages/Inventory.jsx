import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HardwareAssetList from "../Inner_sections/HardwareAssetInventory";
import SoftwareAssetList from "../Inner_sections/SoftwareAssetInventory";
import CoreCompanyLicenseList from "../Inner_sections/CoreCompanyLicenseInventory";
import "../Page_styles/Inventory.css";

const Inventory = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("hardware");

  useEffect(() => {
    const tabFromURL = new URLSearchParams(location.search).get("tab");
    if (tabFromURL) {
      setActiveTab(tabFromURL);
    }
  }, [location.search]);

  return (
    <div className="inventory-container">
      {/* <h2 className="classify_heading"> Inventory</h2> */}

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
        {/* <button
          className={activeTab === "core" ? "tab active" : "tab"}
          onClick={() => setActiveTab("core")}
        >
          <span className="tab-text2">Core Licenses</span>
        </button> */}
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
