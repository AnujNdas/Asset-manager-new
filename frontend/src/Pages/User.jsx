import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Page_styles/User.css";
import Login from "../Inner_sections/Login";
import Signup from "../Inner_sections/Signup";

const User = ({ removeUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const navigateToLogin = () => {
    setIsLogin(true);
    navigate("/user/login");
  };

  const navigateToSignup = () => {
    setIsLogin(false);
    navigate("/user/signup");
  };

  const goBackToHomepage = () => {
    navigate("/", { replace: true });
    removeUser();
  };

  return (
    <div className="user-overlay">
      <div className="user-card">
        <button onClick={goBackToHomepage} className="back-btn">
          ⬅ Back to Homepage
        </button>

        <h2 className="welcome-text">Welcome to Asset Manager</h2>

        <div className="tab-buttons">
          <button
            onClick={navigateToLogin}
            className={`tab-btn ${isLogin ? "active" : ""}`}
          >
            Login
          </button>
          <button
            onClick={navigateToSignup}
            className={`tab-btn ${!isLogin ? "active" : ""}`}
          >
            Signup
          </button>
        </div>

        <div className="auth-section">
          {isLogin ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  );
};

export default User;
