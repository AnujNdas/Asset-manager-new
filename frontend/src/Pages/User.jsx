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
    <div className="user-overlay">
      <div className="user-card">
        <div className="tab-buttons">
          <button
            onClick={() => navigate("/user/login")}
            className={`tab-btn ${location.pathname.includes("login") ? "active" : ""}`}
          >
            Login
          </button>
          <button
            onClick={() => navigate("/user/signup")}
            className={`tab-btn ${location.pathname.includes("signup") ? "active" : ""}`}
          >
            Signup
          </button>
        </div>

        <div className="auth-section">
          <Outlet /> {/* Login or Signup will render here */}
        </div>
      </div>
    </div>
  );
};

export default User;
