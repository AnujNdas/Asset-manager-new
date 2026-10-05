import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";

import AffiliateSidebar from "../Components/affiliate/AffiliateSidebar";
import "../Page_styles/Affiliate.css";

export default function AffiliateLayout() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="affiliate-layout">

      {/* Mobile / Tablet Header */}
      <header className="affiliate-mobile-header">

        <button
          className="affiliate-menu-btn"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

        <div className="affiliate-mobile-title">
          Affiliate Panel
        </div>

      </header>


      {/* Overlay */}
      <div
        className={`affiliate-sidebar-overlay ${
          sidebarOpen ? "show" : ""
        }`}
        onClick={closeSidebar}
      />


      {/* Sidebar */}
      <AffiliateSidebar
        isOpen={sidebarOpen}
        closeSidebar={closeSidebar}
      />


      {/* Main Content */}
      <main className="affiliate-content">
        <Outlet />
      </main>

    </div>
  );
}