import React, { useState, useEffect } from "react";
import "../Component_styles/Sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, useLocation } from "react-router-dom";
import image from "../Images/logo.webp";

import {
  faGauge,
  faCartShopping,
  faGear,
  faReceipt,
  faUserPlus,
  faCreditCard,
  faBoxOpen,
  faStore,
  faCheck,
  faRecycle,
  faMultiply,
  faPerson,
} from "@fortawesome/free-solid-svg-icons";
import { fa42Group, faOpencart, faStripe, faTeamspeak } from "@fortawesome/free-brands-svg-icons";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();

  // ✅ Stable toggle (no stale state issue)
const toggleMenu = (menu) => {
  console.log("clicked", menu);
  setOpenMenu((prev) => (prev === menu ? null : menu));
};

  // ✅ Auto-open correct dropdown based on route
useEffect(() => {
  if (
    ["/assetCapture", "/inventory", "/track-records"].includes(location.pathname)
  ) {
    setOpenMenu("assets");
  } else if (
    ["/assignment", "/employee", "/classification"].includes(location.pathname)
  ) {
    setOpenMenu("workforce");
  }
}, []); // ✅ runs once only

  // ✅ Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Prevent body scroll on mobile sidebar open
  useEffect(() => {
    document.body.style.overflow = isOpen && isMobile ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, isMobile]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && isMobile && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}

      <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
        <div className="sidebar">
          {/* Logo */}
          <div className="sidebar-heading">
            <div className="title-head">
              <div className="logo-wrapper">
                <img src="/images/Logo2.png" alt="Logo" className="app-logo" />
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="sidebar-menu">
            <ul>
              {/* Dashboard */}
              <li>
                <NavLink
                  to="/dashboard"
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FontAwesomeIcon icon={faGauge} style={{ width: "25%" }} />
                  <span className="tab-text">Dashboard</span>
                </NavLink>
              </li>

              {/* Asset Operations */}
 <li className="sb-group">
  <div
    onClick={() => toggleMenu("assets")}
    className={`sb-group-header ${
      openMenu === "assets" ? "active" : ""
    }`}
  >
    <FontAwesomeIcon icon={faBoxOpen} style={{ width: "25%" }} />
    <span className="tab-text">Operations</span>

    <span className={`sb-arrow ${openMenu === "assets" ? "open" : ""}`}>
      ▼
    </span>
  </div>

  {openMenu === "assets" && (
    <ul className="sb-group-content">
      <li>
        <NavLink to="/assetCapture" onClick={closeSidebar} className={({ isActive }) => (isActive ? "active" : "")}>
        <FontAwesomeIcon icon={faCartShopping} style={{ width: "25%" }} />
          Asset Capture
        </NavLink>
      </li>
      <li>
        <NavLink to="/inventory" onClick={closeSidebar} className={({ isActive }) => (isActive ? "active" : "")}>
        <FontAwesomeIcon icon={faStore} style={{ width: "25%" }} />
          Inventory
        </NavLink>
      </li>
      <li>
        <NavLink to="/instance-assets" onClick={closeSidebar} className={({ isActive }) => (isActive ? "active" : "")}>
        <FontAwesomeIcon icon={fa42Group} style={{ width: "25%" }} />
          Instance Dashboard
        </NavLink>
      </li>
      <li>
        <NavLink to="/tracking" onClick={closeSidebar} className={({ isActive }) => (isActive ? "active" : "")}>
        <FontAwesomeIcon icon={faCheck} style={{ width: "25%" }} />
          Track Records
        </NavLink>
      </li>
    </ul>
  )}
</li>

              {/* MIS Report */}
              <li>
                <NavLink
                  to="/misReport"
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FontAwesomeIcon icon={faReceipt} style={{ width: "25%" }} />
                  <span className="tab-text">Audit Report</span>
                </NavLink>
              </li>

              {/* Workforce */}
              <li className="sb-group">
                <div
                  onClick={() => toggleMenu("workforce")}
                  className={`sb-group-header ${
                    openMenu === "workforce" ? "active" : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faUserPlus}
                    style={{ width: "25%" }}
                  />
                  <span className="tab-text">Workforce</span>

                  {/* Arrow */}
                  <span
                    className={`sb-arrow ${
                      openMenu === "workforce" ? "open" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>

                {openMenu === "workforce" && (
                  <ul className="sb-group-content">
                    <li>
                      <NavLink
                        to="/assignment"
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                          isActive ? "active" : ""
                        }
                      >
                    <FontAwesomeIcon icon={faReceipt} style={{ width: "25%" }} />      
                        Assignment
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/employee"
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                          isActive ? "active" : ""
                        }
                      >
                          <FontAwesomeIcon icon={faPerson} style={{ width: "25%" }} />
                        Teams
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/classification"
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                          isActive ? "active" : ""
                        }
                      >
                          <FontAwesomeIcon icon={faRecycle} style={{ width: "25%" }} />
                        Classifications
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              {/* Subscription */}
              <li>
                <NavLink
                  to="/subscription"
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FontAwesomeIcon
                    icon={faCreditCard}
                    style={{ width: "25%" }}
                  />
                  <span className="tab-text">Subscription</span>
                </NavLink>
              </li>

              {/* Settings */}
              <li>
                <NavLink
                  to="/setting"
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FontAwesomeIcon icon={faGear} style={{ width: "25%" }} />
                  <span className="tab-text">Settings</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;