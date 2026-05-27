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
import PlanTimer from "./PlanTimer";
import { useTour } from "../Context/TourContext";
import OnboardingSliderPage from "../Pages/OnboardingSlider";
const Menubar = ({ username, toggleSidebar }) => {
  const navigate = useNavigate();
  const toggleButtonRef = useRef(null);

  const [isDropdownVisible, setDropdownVisible] = useState(false);

  // A2HS states
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);
  const [showOnboarding, setShowOnboarding] = useState(false);
useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
  useEffect(() => {
    // 👉 Check if already installed
    const installedBefore = localStorage.getItem("pwaInstalled");

    // 👉 Detect standalone mode (Android + Desktop)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    // 👉 Detect iOS installed mode
    const isiOSInstalled = window.navigator.standalone === true;

    if (installedBefore || isStandalone || isiOSInstalled) {
      setShowInstallButton(false);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for actual install event
    window.addEventListener("appinstalled", () => {
      console.log("PWA Installed!");
      localStorage.setItem("pwaInstalled", "true");
      setShowInstallButton(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      console.log("User accepted install");
      localStorage.setItem("pwaInstalled", "true");
      setShowInstallButton(false);
    }

    setDeferredPrompt(null);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };


const { startTour } = useTour();
  return (
    <div className="menubar-container">
      <div className="menubar">
        <div className="title-text">
          {isMobile ? (
            "AMS"
          ) : (
            <>
              Asset
              <span>Management</span>
              <span>System</span>
            </>
          )}
        </div>
<div className="plan-timer-wrapper">
  <PlanTimer />
</div>
        <div className="control-panel">
<button
  onClick={() => setShowOnboarding(true)}
  style={{
    border: "none",
    background: "transparent",
    cursor: "pointer",
  }}
>
  <FontAwesomeIcon
    icon={faCircleQuestion}
    style={{ color: "#DFD0B8" }}
  />
</button>
          <NotificationButton />

          {/* HELP ICON */}
          {/* <button className="controls">
            <FontAwesomeIcon icon={faCircleQuestion} style={{ color: "#2346ed" }} />
          </button> */}

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
              {showOnboarding && (
  <div className="onboarding-overlay">
    <OnboardingSliderPage
      onClose={() => setShowOnboarding(false)}
    />
  </div>
)}
      <ProfileDropdown
        isVisible={isDropdownVisible}
        onClose={() => setDropdownVisible(false)}
        toggleButtonRef={toggleButtonRef}
      />
    </div>
  );
};

export default Menubar;
