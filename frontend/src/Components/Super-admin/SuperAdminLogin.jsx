import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { superAdminLogin } from "../../Services/AdminServices"; 
import "../../Component_styles/super-admin/SuperAdminLogin.css";

export default function SuperAdminLogin({ setProfileUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    Swal.fire(
      "Error",
      "Please fill in all required fields",
      "error"
    );
    return;
  }

  try {
    setLoading(true);

    const res = await superAdminLogin(email, password);

    // ==========================================
    // USER OBJECT
    // ==========================================

    const user = {
      ...res.user,
      role: res.user?.role || "super-admin",
    };

    // ==========================================
    // STANDARD AUTH STORAGE
    // ProtectedRoute expects this
    // ==========================================

    localStorage.setItem(
      "auth",
      JSON.stringify({
        token: res.token,
        user: user,
      })
    );

    // ==========================================
    // OPTIONAL / BACKWARD COMPATIBILITY
    // ==========================================

    localStorage.setItem("token", res.token);

    localStorage.setItem("role", user.role);

    localStorage.setItem(
      "username",
      user.username || res.username || "Super Admin"
    );

    // ==========================================
    // PROFILE
    // ==========================================

    if (setProfileUser) {
      setProfileUser(
        user.username || res.username || "Super Admin"
      );
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    Swal.fire({
      icon: "success",
      title: "Access Granted",
      text: "Welcome back, Super Admin.",
      timer: 1500,
      showConfirmButton: false,
    });

    navigate("/super-admin/dashboard", {
      replace: true,
    });

  } catch (err) {
    Swal.fire(
      "Authentication Failed",
      err.error ||
        err.message ||
        "Invalid credentials or unauthorized access.",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

return (
  <div className="sa-login-page">

    <div className="sa-login-card">

      {/* =========================
          LEFT — LOGIN SECTION
      ========================= */}
      <div className="sa-login-left">

        <div className="sa-login-content">

          <div className="sa-login-header">
            <h1>Login</h1>
            <p>Welcome back, Super Admin</p>
          </div>

          <form onSubmit={handleLogin} className="sa-login-form">

            {/* Email */}
            <div className="sa-form-group">
              <label htmlFor="admin-email">
                Username or email
              </label>

              <input
                id="admin-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="sa-form-group">
              <div className="sa-password-label">
                <label htmlFor="admin-password">
                  Password
                </label>

                <button
                  type="button"
                  className="sa-forgot-password"
                  onClick={() => {
                    Swal.fire(
                      "Password Recovery",
                      "Please contact the platform administrator to reset your password.",
                      "info"
                    );
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <input
                id="admin-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Remember */}
            <div className="sa-remember-row">
              <label className="sa-remember-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
            </div>

            {/* Login */}
            <button
              type="submit"
              className="sa-login-btn"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Login"}
            </button>

          </form>

          <div className="sa-login-footer">
            <p>
              Protected System · 256-Bit Encrypted Session
            </p>
          </div>

        </div>
      </div>


      {/* =========================
          RIGHT — INFORMATION PANEL
      ========================= */}
      <div className="sa-login-right">

        <div className="sa-right-content">

          <div className="sa-illustration-wrapper">
<img
  src={`${process.env.PUBLIC_URL}/images/superadminimage.webp`}
  alt="Secure administration"
  className="sa-login-illustration"
/>
          </div>

          <h2>
            Secure Administration
          </h2>

          <p>
            Manage your platform, organizations, subscriptions,
            users and system operations from one secure portal.
          </p>

          <div className="sa-slider-indicators">
            <span className="active"></span>
            <span></span>
            <span></span>
          </div>

        </div>

      </div>

    </div>

  </div>
);
}