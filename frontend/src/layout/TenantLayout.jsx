
import Menubar from "../Components/Menubar";
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/Footer";

import { Outlet } from "react-router-dom";
import { useState } from "react";

import { FiMenu } from "react-icons/fi";

const TenantLayout = ({ profileUser }) => {
  // Mobile sidebar drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Desktop sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div
      className={`app-wrapper ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      {/* SIDEBAR */}
      <Sidebar
        isOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* MAIN APPLICATION AREA */}
      <div className="app-main">

        {/* TOP NAVIGATION */}
        <section className="second-container">

          <button
            type="button"
            className="toggle-btn"
            onClick={toggleSidebar}
            aria-label="Open navigation"
            aria-expanded={isSidebarOpen}
          >
            <FiMenu />
          </button>

          <Menubar username={profileUser} />

        </section>

        {/* PAGE CONTENT */}
        <main className="third-container">
          <Outlet />
        </main>

        {/* FOOTER */}
        <footer className="fourth-container">
          <Footer />
        </footer>

      </div>
    </div>
  );
};

export default TenantLayout;
