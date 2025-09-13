import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import "../Page_styles/Classification.css";
import Unit from "../Inner_sections/Unit";
import Category from "../Inner_sections/Category";
import Location from "../Inner_sections/Location";
import Status from "../Inner_sections/Status";

const tabs = [
  { name: "Location", path: "/classification/location" },
  { name: "Unit", path: "/classification/unit" },
  { name: "Category", path: "/classification/category" },
  { name: "Status", path: "/classification/status" },
];

const Classification = () => {
  const location = useLocation();

  return (
    <div className="classification_container">
      <div className="classify_heading">Classification</div>

      {/* Horizontal Tabs */}
      <div className="tabs_container">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.path}
            className={`tab_link ${location.pathname === tab.path ? "active" : ""}`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      {/* Content Area */}
      <div className="classify_items">
        <Routes>
          <Route path="/" element={<Navigate to="location" />} />
          <Route path="/unit" element={<Unit />} />
          <Route path="/category" element={<Category />} />
          <Route path="/location" element={<Location />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </div>
    </div>
  );
};

export default Classification;
