import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "../Page_styles/User.css";
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

      {/* LEFT SIDE */}
      <div className="auth-left">
<div className="dash-logo">
  <img
    src="/images/Logo.png"
    alt="Socialfly Logo"
    width="100"
    height="100"
    loading="eager"
    decoding="async"
  />
</div>
        <div className="auth-header">
          <h2>Asset Management System</h2>
        </div>

        <div className="auth-content">
          <div className="tab-buttons">
            <button
              onClick={() => navigate("/user/login")}
              className={`tab-btn ${
                location.pathname.includes("login") ? "active" : ""
              }`}
            >
              Login
            </button>

            <button
              onClick={() => navigate("/user/signup")}
              className={`tab-btn ${
                location.pathname.includes("signup") ? "active" : ""
              }`}
            >
              Signup
            </button>
          </div>

          <div className="auth-section">
            <Outlet />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
        <div className="right-content">

          <h1>Complete Asset Management <br/>(Hardware & Software)</h1>
          <p>
            Log in to access your AMS dashboard and manage your team.
          </p>
          <div className="dash-image">
  <img
    src="/images/Dashboard.webp"
    alt="Dashboard preview"
    loading="eager"
    fetchpriority="high"
    decoding="async"
  />
</div>
        </div>
      </div>

    </div>
  </div>
);

};

export default User;
