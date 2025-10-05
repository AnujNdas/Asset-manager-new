import React, { useContext } from "react";
import "../Component_styles/Sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";
import image from "../Images/logo.png";
import { ThemeContext } from "../Context/ThemeContext";
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
// import Switch from "./Switch";

const Sidebar = ({ closeSidebar }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`sidebar-container ${theme}`}>
      <div className={`sidebar ${theme}`}>
        <div className={`sidebar-heading ${theme}`}>
          <div className={`title ${theme}`}>Vault<span>ifly</span><FontAwesomeIcon icon={faPaperPlane} style={{ marginLeft: "8px", color: "#6596ffff" }} /></div>
        </div>
        <div className={`sidebar-menu ${theme}`}>
          <ul>
            <li>
              <NavLink to="/" onClick={closeSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                <FontAwesomeIcon icon={faGauge} style={{ width: "25%" }} />
                <span className="tab-text">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/assetCapture" onClick={closeSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                <FontAwesomeIcon icon={faCartShopping} style={{ width: "25%" }} />
                <span className="tab-text">Asset Capture</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/inventory" onClick={closeSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                <FontAwesomeIcon icon={faLayerGroup} style={{ width: "25%" }} />
                <span className="tab-text">Inventory</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/misReport" onClick={closeSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                <FontAwesomeIcon icon={faReceipt} style={{ width: "25%" }} />
                <span className="tab-text">MIS Report</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/classification" onClick={closeSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                <FontAwesomeIcon icon={faRecycle} style={{ width: "25%" }} />
                <span className="tab-text">Classifications</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/scanner" onClick={closeSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                <FontAwesomeIcon icon={faExpand} style={{ width: "25%" }} />
                <span className="tab-text">Scanner</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/setting" onClick={closeSidebar} className={({ isActive }) => isActive ? "active" : ""}>
                <FontAwesomeIcon icon={faGear} style={{ width: "25%" }} />
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
