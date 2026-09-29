import React from "react";
import "../../Component_styles/super-admin/Loader.css";

export default function Loader({ text = "Loading Super Admin Dashboard..." }) {
  return (
    <div className="super-admin-loader-container">
      <div className="loader-content-wrapper">
        <div className="admin-spinner"></div>
        <p className="loader-text">{text}</p>
      </div>
    </div>
  );
}