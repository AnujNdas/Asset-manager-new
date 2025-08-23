import React, { useState , useRef } from "react";
import "../Component_styles/Menubar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCircleQuestion,
  faMagnifyingGlass,
  faUser,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./Profiledropdown";

const Menubar = ({ username  , toggleSidebar}) => {
  const navigate = useNavigate();
  const toggleButtonRef = useRef(null);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  // Toggle the visibility of the dropdown
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handlenotification = () => {
    navigate("/Setting/Notification")
  }

  return (
    <div className="menubar-container">
      <div className="menubar">
        {/* <div className="search-box">
          <input type="text" placeholder="Search" className="search-input" />
          <button className="search-btn">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div> */}
        <div className="control-panel">
          <button className="controls" onClick={handlenotification}>
            <FontAwesomeIcon icon={faBell} style={{ color: "#7870f7" }} />
          </button>
          <button className="controls">
            <FontAwesomeIcon
              icon={faCircleQuestion}
              style={{ color: "#7870f7" }}
            />
          </button>

          {/* Profile Dropdown */}
          <button className="profile-button" onClick={toggleDropdown} ref={toggleButtonRef}>
            <FontAwesomeIcon icon={faUser} style={{ fontSize: "20px" }} />
            <FontAwesomeIcon
              icon={faAngleDown}
              style={{
                fontSize: "16px",
                transform: isDropdownVisible
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                transition: "transform 0.3s ease-in-out", // Smooth rotation transition
              }}
            />
          </button>
        </div>
      </div>

      {/* Pass visibility state to ProfileDropdown */}
      <ProfileDropdown isVisible={isDropdownVisible} onClose={() => setDropdownVisible(false)} toggleButtonRef={toggleButtonRef}/>
    </div>
  );
};

export default Menubar;
