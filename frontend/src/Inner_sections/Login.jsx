import React, { useState } from 'react';
import '../Page_styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import image from '../Images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import AuthService from '../Services/AuthService';
import Swal from 'sweetalert2';

const Login = ({ setProfileUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Keep your original logic intact
  const handlelogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.login(username, password);
      if (response && response.token) {
        sessionStorage.setItem("token", response.token);
        sessionStorage.setItem("username", username);

        Swal.fire({
          title: "Success",
          text: "Login Successful!",
          icon: "success",
          confirmButtonText: "OK"
        });
        navigate("/");
      } else {
        Swal.fire({
          title: "Unexpected Error",
          text: "Unexpected response format. Please try again.",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    } catch (error) {
      if (error.response) {
        Swal.fire({
          title: "Error",
          text: error.response?.data?.error || "Login failed.",
          icon: "error",
          confirmButtonText: "OK"
        });
      } else if (error.request) {
        Swal.fire({
          title: "Network Error",
          text: "No response from the server.",
          icon: "error",
          confirmButtonText: "OK"
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "An error occurred. Please try again.",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand / Welcome panel (left on desktop, stacked on mobile) */}
        <aside className="brand-panel">
          <img src={image} alt="Logo" className="brand-logo" />
          <h1>Welcome back</h1>
          <p className="brand-sub">
            Sign in to access your dashboard and continue where you left off.
          </p>
        </aside>

        {/* Form panel */}
        <form className="form-panel" onSubmit={handlelogin}>
          <div className="form-header">
            {/* <img src={image} alt="Logo" className="form-logo" /> */}
            <h2>Sign in</h2>
            <p className="form-sub">Use your account credentials</p>
          </div>

          <div className="social-row" aria-label="Social options">
            <button type="button" className="social-btn" title="Facebook"><FontAwesomeIcon icon={faFacebook} /></button>
            <button type="button" className="social-btn" title="Twitter"><FontAwesomeIcon icon={faTwitter} /></button>
            <button type="button" className="social-btn" title="LinkedIn"><FontAwesomeIcon icon={faLinkedin} /></button>
            <button type="button" className="social-btn" title="GitHub"><FontAwesomeIcon icon={faGithub} /></button>
          </div>

          <div className="divider"><span>or</span></div>

          <label className="field">
            <span className="field-label"><FontAwesomeIcon icon={faEnvelope} /> Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </label>

          <label className="field">
            <span className="field-label"><FontAwesomeIcon icon={faLock} /> Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          <div className="form-actions">
            <Link to="/forget" className="link">Forgot password?</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </div>

          <p className="tiny-note">
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
