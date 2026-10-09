import React, { useEffect, useState } from "react";
import { getCategories } from "../Services/ApiServices";
import "../Component_styles/CategoryViewer.css";
import {
  FiGrid,
  FiLayers,
  FiSearch,
  FiX,
  FiFilter,
  FiMonitor,
  FiBox,
  FiChevronRight,
  FiInbox,
  FiCode,
  FiPackage,
} from "react-icons/fi";
const CategoryViewer = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      console.log("API Response:", res);
      setCategories(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  // 🔍 Search filter
  const filtered = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  // 🧠 Separate categories
  const hardwareCategories = filtered.filter(
    (cat) => cat.categoryType === "hardware"
  );

  const softwareCategories = filtered.filter(
    (cat) => cat.categoryType === "software"
  );

  return (

<div className="category-container">

  {/* ================= PAGE HEADER ================= */}
  <div className="category-page-header">
    <div className="category-heading">
      <div className="category-heading-icon">
        <FiGrid />
      </div>

      <div>
        <h1>Asset Categories</h1>
        <p>
          Browse and explore your hardware and software
          asset classifications.
        </p>
      </div>
    </div>

    <div className="category-total-badge">
      <FiLayers />
      <span>
        {hardwareCategories.length + softwareCategories.length}
        {" "}Categories
      </span>
    </div>
  </div>

  {/* ================= SEARCH ================= */}
  <div className="category-toolbar">
    <div className="category-search-wrapper">
      <FiSearch className="category-search-icon" />

      <input
        type="text"
        placeholder="Search asset categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
        aria-label="Search asset categories"
      />

      {search && (
        <button
          type="button"
          className="category-clear-search"
          onClick={() => setSearch("")}
          aria-label="Clear search"
        >
          <FiX />
        </button>
      )}
    </div>

    <div className="category-search-info">
      <FiFilter />
      <span>
        {search ? "Filtered results" : "All categories"}
      </span>
    </div>
  </div>

  {/* ================= CATEGORY GRID ================= */}
  <div className="category-grid">

    {/* ================= HARDWARE ================= */}
    <section className="category-column hardware-inside-column">

      <div className="category-column-header">
        <div className="category-column-title">
          <div className="category-type-icon">
            <FiMonitor />
          </div>

          <div>
            <h2>Hardware</h2>
            <p>Physical assets and equipment</p>
          </div>
        </div>

        <span className="category-count">
          {hardwareCategories.length}
        </span>
      </div>

      <div className="category-list">
        {hardwareCategories.length > 0 ? (
          hardwareCategories.map((cat) => (
            <div
              key={cat._id}
              className="category-card"
            >
              <div className="category-card-icon">
                <FiBox />
              </div>

              <span className="category-card-name">
                {cat.name}
              </span>

              <FiChevronRight className="category-card-arrow" />
            </div>
          ))
        ) : (
          <div className="category-empty">
            <FiInbox />
            <h3>No hardware categories</h3>
            <p>
              {search
                ? "No matching hardware categories found."
                : "Hardware categories will appear here."}
            </p>
          </div>
        )}
      </div>
    </section>

    {/* ================= SOFTWARE ================= */}
    <section className="category-column software-column">

      <div className="category-column-header">
        <div className="category-column-title">
          <div className="category-type-icon">
            <FiCode />
          </div>

          <div>
            <h2>Software</h2>
            <p>Applications, licenses and services</p>
          </div>
        </div>

        <span className="category-count">
          {softwareCategories.length}
        </span>
      </div>

      <div className="category-list">
        {softwareCategories.length > 0 ? (
          softwareCategories.map((cat) => (
            <div
              key={cat._id}
              className="category-card"
            >
              <div className="category-card-icon">
                <FiPackage />
              </div>

              <span className="category-card-name">
                {cat.name}
              </span>

              <FiChevronRight className="category-card-arrow" />
            </div>
          ))
        ) : (
          <div className="category-empty">
            <FiInbox />
            <h3>No software categories</h3>
            <p>
              {search
                ? "No matching software categories found."
                : "Software categories will appear here."}
            </p>
          </div>
        )}
      </div>
    </section>

  </div>
</div>

  );
};

export default CategoryViewer;