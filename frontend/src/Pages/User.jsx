import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "../Page_styles/User.css";
import {
  FiArrowLeft,
  FiLogIn,
  FiUserPlus,
  FiTrendingUp,
  FiArrowUpRight,
  FiLayers,
  FiCheckCircle,
} from "react-icons/fi";
const User = ({ removeUser }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBackToHomepage = () => {
    navigate("/", { replace: true });
    removeUser();
  };

  return (

<div className="auth-wrapper">
  <div className="auth-container">

    {/* ================= LEFT PANEL ================= */}
    <section className="auth-left">

      {/* BACK TO HOME */}
      <div className="back-home">
        <button
          type="button"
          className="return-btn"
          onClick={() => navigate("/")}
        >
          <FiArrowLeft />
          <span>Back to Home</span>
        </button>
      </div>

      {/* BRAND */}
      <div className="auth-brand">
        <div className="dash-logo">
          <img
            src="/images/Logo2.png"
            alt="AssetPegasus Logo"
            width="48"
            height="48"
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="auth-brand-text">
          <span className="auth-brand-name">
            Asset<span>Pegasus</span>
          </span>
          <span className="auth-brand-caption">
            Asset Management Platform
          </span>
        </div>
      </div>

      {/* HEADING */}
      <div className="auth-header">
        <h2>
          Machine + IT Asset Management System
        </h2>

        <p>
          Manage your assets, teams, and operations
          from one secure platform.
        </p>
      </div>

      {/* MAIN AUTH CONTENT */}
      <div className="auth-content">

        {/* AUTH NAVIGATION */}
        <nav
          className="tab-buttons"
          aria-label="Authentication pages"
        >
          <button
            type="button"
            onClick={() => navigate("/user/login")}
            className={`tab-btn ${
              location.pathname === "/user/login"
                ? "active"
                : ""
            }`}
          >
            <FiLogIn />
            <span>Login</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/user/signup")}
            className={`tab-btn ${
              location.pathname === "/user/signup"
                ? "active"
                : ""
            }`}
          >
            <FiUserPlus />
            <span>Sign Up</span>
          </button>
        </nav>

        {/* LOGIN / SIGNUP / FORGOT PASSWORD */}
        <div className="auth-section">
          <Outlet />
        </div>

        {/* AFFILIATE CTA */}
        <div className="affiliate-card">
          <div className="affiliate-icon">
            <FiTrendingUp />
          </div>

          <div className="affiliate-info">
            <h4>Become an Affiliate Partner</h4>
            <p>
              Earn rewards by referring businesses.
            </p>
          </div>

          <button
            type="button"
            className="affiliate-btn"
            onClick={() => navigate("/affiliate/apply")}
          >
            Start Earning
            <FiArrowUpRight />
          </button>
        </div>

      </div>

      {/* BOTTOM TEXT */}
      <div className="auth-bottom">
        <span>
          © {new Date().getFullYear()} AssetPegasus
        </span>
        <span>Secure Asset Management</span>
      </div>
    </section>

    {/* ================= RIGHT PANEL ================= */}
    <aside className="auth-right">
      <div className="right-content">

        <div className="auth-right-badge">
          <FiLayers />
          <span>Asset Management Platform</span>
        </div>

        <h1>
          Manage Every Asset.
          <span> In One Place.</span>
        </h1>

        <p className="auth-right-description">
          Simplify hardware, software, and machinery
          management with one centralized platform.
        </p>

        {/* DASHBOARD PREVIEW */}
        <div className="dash-image">
          <img
            src="/images/Dashboard.webp"
            alt="AssetPegasus Dashboard Preview"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/* FEATURES */}
        <div className="auth-feature-list">
          <div className="auth-feature">
            <FiCheckCircle />
            <span>Asset Tracking</span>
          </div>

          <div className="auth-feature">
            <FiCheckCircle />
            <span>Team Assignments</span>
          </div>

          <div className="auth-feature">
            <FiCheckCircle />
            <span>Reports & Audits</span>
          </div>
        </div>

      </div>
    </aside>

  </div>
</div>

  );
};

export default User;