import React, { useEffect, useState } from "react";
import { getCategories } from "../Services/ApiServices";
import "../Component_styles/CategoryViewer.css";

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
      setCategories(res?.data || []);
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
      {/* 🔍 Search */}
      <div className="category-header">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* 🧩 Split Layout */}
      <div className="category-grid">
        
        {/* 🖥️ Hardware */}
        <div className="category-column">
          <h2>Hardware</h2>
          {hardwareCategories.length > 0 ? (
            hardwareCategories.map((cat) => (
              <div key={cat._id} className="category-card">
                {cat.name}
              </div>
            ))
          ) : (
            <p>No hardware categories</p>
          )}
        </div>

        {/* 💻 Software */}
        <div className="category-column">
          <h2>Software</h2>
          {softwareCategories.length > 0 ? (
            softwareCategories.map((cat) => (
              <div key={cat._id} className="category-card">
                {cat.name}
              </div>
            ))
          ) : (
            <p>No software categories</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default CategoryViewer;