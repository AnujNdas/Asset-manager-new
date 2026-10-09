import React, { useState, useEffect, useRef } from "react";
import "../Component_styles/Menubar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  FiLayers,
  FiHelpCircle,
  FiDownload,
  FiUser,
  FiChevronDown,
} from "react-icons/fi";
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
  if (showOnboarding) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [showOnboarding]);
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

    {/* ================= BRAND / PAGE TITLE ================= */}
    <div className="menubar-brand">
      <div className="menubar-brand-icon">
        <FiLayers />
      </div>

      <div className="menubar-brand-content">
        <div className="title-text">
          <span className="brand-asset">Asset</span>
          <span className="brand-management">Management</span>
          <span className="brand-system">System</span>
        </div>

        <p className="menubar-subtitle">
          Management Console
        </p>
      </div>
    </div>

    {/* ================= PLAN TIMER ================= */}
    <div className="plan-timer-wrapper">
      <div className="plan-timer-content">
        <PlanTimer />
      </div>
    </div>

    {/* ================= RIGHT CONTROLS ================= */}
    <div className="control-panel">

      {/* ONBOARDING / HELP */}
      <button
        type="button"
        className="menubar-icon-btn"
        onClick={() => setShowOnboarding(true)}
        title="View onboarding guide"
        aria-label="View onboarding guide"
      >
        <FiHelpCircle />
      </button>

      {/* NOTIFICATIONS */}
      <div className="menubar-notification">
        <NotificationButton />
      </div>

      {/* INSTALL APP */}
      {showInstallButton && (
        <button
          type="button"
          className="menubar-icon-btn menubar-install-btn"
          onClick={handleInstallClick}
          title="Install AssetPegasus"
          aria-label="Install AssetPegasus"
        >
          <FiDownload />
          <span className="install-label">
            Install App
          </span>
        </button>
      )}

      {/* SEPARATOR */}
      <div className="menubar-control-divider" />

      {/* PROFILE DROPDOWN BUTTON */}
      <button
        type="button"
        className={`profile-button ${
          isDropdownVisible ? "active" : ""
        }`}
        onClick={toggleDropdown}
        ref={toggleButtonRef}
        aria-label="Open profile menu"
        aria-expanded={isDropdownVisible}
        aria-haspopup="menu"
      >
        <div className="menubar-profile-avatar">
          <FiUser />
        </div>

        <span className="menubar-profile-label">
          Account
        </span>

        <FiChevronDown
          className={`profile-chevron ${
            isDropdownVisible ? "rotated" : ""
          }`}
        />
      </button>

    </div>
  </div>

  {/* ================= ONBOARDING OVERLAY ================= */}
  {showOnboarding && (
    <div className="onboarding-overlay">
      <OnboardingSliderPage
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  )}

  {/* ================= PROFILE DROPDOWN ================= */}
  <ProfileDropdown
    isVisible={isDropdownVisible}
    onClose={() => setDropdownVisible(false)}
    toggleButtonRef={toggleButtonRef}
  />
</div>

  );
};

export default Menubar;
