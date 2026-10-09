
import React, { useState, useEffect } from "react";

import "../Component_styles/Sidebar.css";

import { NavLink, useLocation } from "react-router-dom";

import {
  FiGrid,
  FiBox,
  FiShoppingCart,
  FiArchive,
  FiLayers,
  FiActivity,
  FiFileText,
  FiUsers,
  FiClipboard,
  FiTag,
  FiCreditCard,
  FiSettings,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";

const MOBILE_BREAKPOINT = 900;

const operationsRoutes = [
  "/assetCapture",
  "/inventory",
  "/instance-assets",
  "/tracking",
];

const workforceRoutes = [
  "/assignment",
  "/employee",
  "/classification",
];

const matchesRoute = (pathname, route) =>
  pathname === route || pathname.startsWith(`${route}/`);

const Sidebar = ({
  isOpen,
  closeSidebar,
  isCollapsed,
  setIsCollapsed,
}) => {
  const location = useLocation();

  // Responsive detection
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.innerWidth <= MOBILE_BREAKPOINT
  );

  // Detect current active navigation group
  const isOperationsActive = operationsRoutes.some((route) =>
    matchesRoute(location.pathname, route)
  );

  const isWorkforceActive = workforceRoutes.some((route) =>
    matchesRoute(location.pathname, route)
  );

  // Initialize group from current route
  const [openMenu, setOpenMenu] = useState(() => {
    if (
      operationsRoutes.some((route) =>
        matchesRoute(location.pathname, route)
      )
    ) {
      return "assets";
    }

    if (
      workforceRoutes.some((route) =>
        matchesRoute(location.pathname, route)
      )
    ) {
      return "workforce";
    }

    return null;
  });

  // Update mobile state when viewport changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth <= MOBILE_BREAKPOINT
      );
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Auto-open the group for the current route
  useEffect(() => {
    if (isOperationsActive) {
      setOpenMenu("assets");
    } else if (isWorkforceActive) {
      setOpenMenu("workforce");
    }
  }, [
    location.pathname,
    isOperationsActive,
    isWorkforceActive,
  ]);

  // Prevent background scrolling while mobile drawer is open
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isMobile]);

  // Close mobile sidebar when changing to desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      closeSidebar();
    }
  }, [isMobile, isOpen, closeSidebar]);

  // Toggle accordion group
  const toggleMenu = (group) => {
    setOpenMenu((prev) =>
      prev === group ? null : group
    );
  };

  // Handle group click when sidebar is collapsed
  const handleGroupClick = (group) => {
    if (isCollapsed && !isMobile) {
      setIsCollapsed(false);
      setOpenMenu(group);
      return;
    }

    toggleMenu(group);
  };

  // Collapse desktop sidebar
  const handleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const sidebarClassName = [
    "sidebar-container",
    isOpen && isMobile ? "open" : "",
    isCollapsed && !isMobile ? "collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isOpen && isMobile && (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={sidebarClassName}
        aria-label="Main navigation"
      >
        <div className="sidebar">

          {/* ================= BRAND ================= */}

          <div className="sidebar-heading">

            <NavLink
              to="/dashboard"
              className="sidebar-brand"
              onClick={closeSidebar}
              title="AssetPegasus"
            >
              <div className="logo-wrapper">
                <img
                  src="/images/Logo2.png"
                  alt="AssetPegasus"
                  className="app-logo"
                />
              </div>

              <div className="sidebar-brand-text">
                <strong>AssetPegasus</strong>
                <span>Asset Management</span>
              </div>
            </NavLink>

            {/* DESKTOP COLLAPSE BUTTON */}
            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={handleCollapse}
              aria-label={
                isCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              title={
                isCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? (
                <FiChevronRight />
              ) : (
                <FiChevronLeft />
              )}
            </button>

            {/* MOBILE CLOSE BUTTON */}
            <button
              type="button"
              className="sidebar-mobile-close"
              onClick={closeSidebar}
              aria-label="Close navigation"
            >
              <FiX />
            </button>

          </div>

          {/* ================= NAVIGATION ================= */}

          <nav className="sidebar-menu">

            <div className="sidebar-nav-label">
              MAIN MENU
            </div>

            <ul className="sidebar-nav-list">

              {/* DASHBOARD */}
              <li>
                <NavLink
                  to="/dashboard"
                  end
                  onClick={closeSidebar}
                  title="Dashboard"
                  className={({ isActive }) =>
                    `sidebar-nav-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <FiGrid className="sidebar-nav-icon" />
                  <span className="tab-text">
                    Dashboard
                  </span>
                </NavLink>
              </li>

              {/* ================= OPERATIONS ================= */}

              <li className="sb-group">

                <button
                  type="button"
                  onClick={() => handleGroupClick("assets")}
                  className={`sb-group-header ${
                    openMenu === "assets" ||
                    isOperationsActive
                      ? "active"
                      : ""
                  }`}
                  aria-expanded={
                    !isCollapsed &&
                    openMenu === "assets"
                  }
                  title="Operations"
                >
                  <FiBox className="sidebar-nav-icon" />

                  <span className="tab-text">
                    Operations
                  </span>

                  <FiChevronDown
                    className={`sb-arrow ${
                      openMenu === "assets"
                        ? "open"
                        : ""
                    }`}
                  />
                </button>

                {openMenu === "assets" &&
                  (!isCollapsed || isMobile) && (
                    <ul className="sb-group-content">

                      <li>
                        <NavLink
                          to="/assetCapture"
                          onClick={closeSidebar}
                          className={({ isActive }) =>
                            `sidebar-sub-link ${
                              isActive ? "active" : ""
                            }`
                          }
                        >
                          <FiShoppingCart />
                          <span>Asset Capture</span>
                        </NavLink>
                      </li>

                      <li>
                        <NavLink
                          to="/inventory"
                          onClick={closeSidebar}
                          className={({ isActive }) =>
                            `sidebar-sub-link ${
                              isActive ? "active" : ""
                            }`
                          }
                        >
                          <FiArchive />
                          <span>Inventory</span>
                        </NavLink>
                      </li>

                      <li>
                        <NavLink
                          to="/instance-assets"
                          onClick={closeSidebar}
                          className={({ isActive }) =>
                            `sidebar-sub-link ${
                              isActive ? "active" : ""
                            }`
                          }
                        >
                          <FiLayers />
                          <span>Instance Dashboard</span>
                        </NavLink>
                      </li>

                      <li>
                        <NavLink
                          to="/tracking"
                          onClick={closeSidebar}
                          className={({ isActive }) =>
                            `sidebar-sub-link ${
                              isActive ? "active" : ""
                            }`
                          }
                        >
                          <FiActivity />
                          <span>Track Records</span>
                        </NavLink>
                      </li>

                    </ul>
                  )}
              </li>

              {/* ================= AUDIT ================= */}

              <li>
                <NavLink
                  to="/misReport"
                  onClick={closeSidebar}
                  title="Audit Report"
                  className={({ isActive }) =>
                    `sidebar-nav-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <FiFileText className="sidebar-nav-icon" />
                  <span className="tab-text">
                    Audit Report
                  </span>
                </NavLink>
              </li>

              {/* ================= WORKFORCE ================= */}

              <li className="sb-group">

                <button
                  type="button"
                  onClick={() =>
                    handleGroupClick("workforce")
                  }
                  className={`sb-group-header ${
                    openMenu === "workforce" ||
                    isWorkforceActive
                      ? "active"
                      : ""
                  }`}
                  aria-expanded={
                    !isCollapsed &&
                    openMenu === "workforce"
                  }
                  title="Workforce"
                >
                  <FiUsers className="sidebar-nav-icon" />

                  <span className="tab-text">
                    Workforce
                  </span>

                  <FiChevronDown
                    className={`sb-arrow ${
                      openMenu === "workforce"
                        ? "open"
                        : ""
                    }`}
                  />
                </button>

                {openMenu === "workforce" &&
                  (!isCollapsed || isMobile) && (
                    <ul className="sb-group-content">

                      <li>
                        <NavLink
                          to="/assignment"
                          onClick={closeSidebar}
                          className={({ isActive }) =>
                            `sidebar-sub-link ${
                              isActive ? "active" : ""
                            }`
                          }
                        >
                          <FiClipboard />
                          <span>Assignment</span>
                        </NavLink>
                      </li>

                      <li>
                        <NavLink
                          to="/employee"
                          onClick={closeSidebar}
                          className={({ isActive }) =>
                            `sidebar-sub-link ${
                              isActive ? "active" : ""
                            }`
                          }
                        >
                          <FiUsers />
                          <span>Teams</span>
                        </NavLink>
                      </li>

                      <li>
                        <NavLink
                          to="/classification"
                          onClick={closeSidebar}
                          className={({ isActive }) =>
                            `sidebar-sub-link ${
                              isActive ? "active" : ""
                            }`
                          }
                        >
                          <FiTag />
                          <span>Classifications</span>
                        </NavLink>
                      </li>

                    </ul>
                  )}
              </li>

            </ul>

            {/* ================= ACCOUNT ================= */}

            <div className="sidebar-nav-divider" />

            <div className="sidebar-nav-label">
              ACCOUNT
            </div>

            <ul className="sidebar-nav-list">

              <li>
                <NavLink
                  to="/subscription"
                  onClick={closeSidebar}
                  title="Subscription"
                  className={({ isActive }) =>
                    `sidebar-nav-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <FiCreditCard className="sidebar-nav-icon" />
                  <span className="tab-text">
                    Subscription
                  </span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/setting"
                  onClick={closeSidebar}
                  title="Settings"
                  className={({ isActive }) =>
                    `sidebar-nav-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <FiSettings className="sidebar-nav-icon" />
                  <span className="tab-text">
                    Settings
                  </span>
                </NavLink>
              </li>

            </ul>

          </nav>

          {/* ================= FOOTER ================= */}

          <div className="sidebar-footer">

            <div className="sidebar-footer-icon">
              <FiBox />
            </div>

            <div className="sidebar-footer-text">
              <strong>AssetPegasus</strong>
              <span>Management Console</span>
            </div>

          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
