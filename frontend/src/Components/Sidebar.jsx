import React, { useContext, useState, useEffect} from "react";
import "../Component_styles/Sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";
import image from "../Images/Socialfly 2k25 Logo (1).png";
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  return (
    <div className="sidebar-container">
      <div className="sidebar">
        <div className="sidebar-heading">
          <div className="title-head">

            <img src={image} alt="icon" className="title-icon" width="50" height="40"/>
          </div>
        </div>
        <div className="sidebar-menu">
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
            {isMobile && (
              <li>
                <NavLink
                  to="/scanner"
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FontAwesomeIcon icon={faExpand} style={{ width: "25%" }} />
                  <span className="tab-text">Scanner</span>
                </NavLink>
              </li>
            )}
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
