import React, { useState, useEffect, useRef } from "react";
import "../Component_styles/Menubar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCircleQuestion,
  faMagnifyingGlass,
  faUser,
  faAngleDown,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./Profiledropdown";
import NotificationButton from "./NotificationBtn";

const Menubar = ({ username, toggleSidebar }) => {
  const navigate = useNavigate();
  const toggleButtonRef = useRef(null);

  const [isDropdownVisible, setDropdownVisible] = useState(false);

  // 👉 A2HS state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Capture beforeinstallprompt
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    });
  }, []);

  // Trigger install prompt
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    console.log("User choice:", result.outcome);

    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  return (
    <div className="menubar-container">
      <div className="menubar">

        <div className="control-panel">
          <NotificationButton />

          {/* HELP ICON */}
          <button className="controls">
            <FontAwesomeIcon icon={faCircleQuestion} style={{ color: "#2346ed" }} />
          </button>

          {/* ⭐ Add to Home Screen Button */}
          {showInstallButton && (
            <button className="controls install-hint" onClick={handleInstallClick} title="Install App">
              <FontAwesomeIcon icon={faDownload} style={{ color: "#28a745" }} />
              <span className="hint-text">Tap here to install</span>
            </button>
          )}

          {/* PROFILE DROPDOWN */}
          <button className="profile-button" onClick={toggleDropdown} ref={toggleButtonRef}>
            <FontAwesomeIcon icon={faUser} style={{ fontSize: "0.9rem" }} />
            <FontAwesomeIcon
              icon={faAngleDown}
              style={{
                fontSize: "16px",
                transform: isDropdownVisible ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease-in-out",
              }}
            />
          </button>
        </div>
      </div>

      <ProfileDropdown
        isVisible={isDropdownVisible}
        onClose={() => setDropdownVisible(false)}
        toggleButtonRef={toggleButtonRef}
      />
    </div>
  );
};

export default Menubar;
