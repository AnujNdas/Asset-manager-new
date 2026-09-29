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
      Swal.fire("Error", "Please fill in all required fields", "error");
      return;
    }

    try {
      setLoading(true);
      // Call your Super Admin authentication API endpoint
      const res = await superAdminLogin(email, password);

      // Save credentials/tokens securely
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.user?.role || "super-admin");
      localStorage.setItem("username", res.user?.username || res.username || "Super Admin");
      if (setProfileUser) setProfileUser(res.user?.username || res.username || "Super Admin");

      Swal.fire({
        icon: "success",
        title: "Access Granted",
        text: "Welcome back, Super Admin.",
        timer: 1500,
        showConfirmButton: false,
      });

      // Redirect to your Super Admin dashboard root route
      navigate("/super-admin/dashboard");
    } catch (err) {
      Swal.fire(
        "Authentication Failed",
        err.error || err.message || "Invalid credentials or unauthorized access.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-login-container">
      <div className="sa-login-card">
        <div className="sa-login-header">
          <div className="sa-lock-badge">🔒</div>
          <h2>Super Admin Portal</h2>
          <p>Restricted access. Authorized personnel only.</p>
        </div>

        <form onSubmit={handleLogin} className="sa-login-form">
          <div className="sa-form-group">
            <label>Admin Email</label>
            <input
              type="email"
              placeholder="admin@platform.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="sa-form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="sa-login-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Access Secure Portal"}
          </button>
        </form>

        <div className="sa-login-footer">
          <p>Protected System · 256-Bit Encrypted Session</p>
        </div>
      </div>
    </div>
  );
}