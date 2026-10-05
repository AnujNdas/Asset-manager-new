import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Outlet } from "react-router-dom";

import SuperAdminSidebar from "../Components/SuperAdminSidebar";
import "../Page_styles/SuperAdminLayout.css";

const SuperAdminLayout = () => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="superadmin-wrapper">

      {/* =====================================================
          MOBILE / TABLET HEADER
      ===================================================== */}

      <header className="sa-mobile-header">

        <button
          className="sa-menu-btn"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? (
            <X size={23} />
          ) : (
            <Menu size={23} />
          )}
        </button>

        <div className="sa-mobile-title">
          Super Admin
        </div>

      </header>


      {/* =====================================================
          SIDEBAR OVERLAY
      ===================================================== */}

      <div
        className={`sa-sidebar-overlay ${
          sidebarOpen ? "show" : ""
        }`}
        onClick={closeSidebar}
      />


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <SuperAdminSidebar
        isOpen={sidebarOpen}
        closeSidebar={closeSidebar}
      />


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="superadmin-content">
        <Outlet />
      </main>

    </div>
  );
};

export default SuperAdminLayout;