import React from "react";
import "../Component_styles/Sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";
import {
  faGauge,
  faLayerGroup,
  faCartShopping,
  faGear,
  faReceipt,
  faPaperPlane,
  faRecycle,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({ closeSidebar }) => {
  return (
    <div className="sidebar-container new-saas">
      <div className="sidebar new-sidebar">
        
        {/* Logo / Branding */}
        <div className="sidebar-heading new-heading">
          <div className="title new-title">
            Vault<span>ifly</span>
            <FontAwesomeIcon
              icon={faPaperPlane}
              className="brand-icon"
            />
          </div>
        </div>

        {/* Menu */}
        <div className="sidebar-menu new-menu">
          <ul>
            <li>
              <NavLink 
                to="/" 
                onClick={closeSidebar} 
                className={({ isActive }) => isActive ? "active new-active" : ""}
              >
                <FontAwesomeIcon icon={faGauge} className="menu-icon"/>
                <span className="tab-text">Dashboard</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/assetCapture"
                onClick={closeSidebar}
                className={({ isActive }) => isActive ? "active new-active" : ""}
              >
                <FontAwesomeIcon icon={faCartShopping} className="menu-icon"/>
                <span className="tab-text">Asset Capture</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/inventory"
                onClick={closeSidebar} 
                className={({ isActive }) => isActive ? "active new-active" : ""}
              >
                <FontAwesomeIcon icon={faLayerGroup} className="menu-icon"/>
                <span className="tab-text">Inventory</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/misReport"
                onClick={closeSidebar}
                className={({ isActive }) => isActive ? "active new-active" : ""}
              >
                <FontAwesomeIcon icon={faReceipt} className="menu-icon"/>
                <span className="tab-text">MIS Report</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/classification"
                onClick={closeSidebar}
                className={({ isActive }) => isActive ? "active new-active" : ""}
              >
                <FontAwesomeIcon icon={faRecycle} className="menu-icon"/>
                <span className="tab-text">Classifications</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/scanner" 
                onClick={closeSidebar}
                className={({ isActive }) => isActive ? "active new-active" : ""}
              >
                <FontAwesomeIcon icon={faExpand} className="menu-icon"/>
                <span className="tab-text">Scanner</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/setting" 
                onClick={closeSidebar}
                className={({ isActive }) => isActive ? "active new-active" : ""}
              >
                <FontAwesomeIcon icon={faGear} className="menu-icon"/>
                <span className="tab-text">Settings</span>
              </NavLink>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;
