import React, { useState } from 'react';
import '../Page_styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import image from '../Images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import AuthService from '../Services/AuthService';
import Swal from 'sweetalert2';
import Loader from "../Components/Loader";
const Login = ({ setProfileUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiDone , setApiDone] = useState(false);
  const navigate = useNavigate();

  // Keep your original logic intact
  const handlelogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.login(email, password);
      if (response && response.token) {
        console.log(response.token)
        sessionStorage.setItem("token", response.token);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("username", response.username);
        sessionStorage.setItem("role", response.role);
        sessionStorage.setItem("userId", response.userId); // ✅ Save userId

        Swal.fire({
          title: "Success",
          text: "Login Successful!",
          icon: "success",
          confirmButtonText: "OK"
        });
        setApiDone(true)
       // ✅ allow progress to hit 100%
    setTimeout(() => {
      setLoading(false);
    }, 400);

        navigate("/");
      } else {
        Swal.fire({
          title: "Unexpected Error",
          text: "Unexpected response format. Please try again.",
          icon: "error",
          confirmButtonText: "OK"
        });
        setLoading(false);
      }
    } catch (error) {
      if (error.response) {
        Swal.fire({
          title: "Error",
          text: error.response?.data?.error || "Login failed.",
          icon: "error",
          confirmButtonText: "OK"
        });
        setLoading(false);
      } else if (error.request) {
        Swal.fire({
          title: "Network Error",
          text: "No response from the server.",
          icon: "error",
          confirmButtonText: "OK"
        });
        setLoading(false);
      } else {
        Swal.fire({
          title: "Error",
          text: "An error occurred. Please try again.",
          icon: "error",
          confirmButtonText: "OK"
        });
        setLoading(false);
      }
    }
  };

  return (
    <>
  {loading && (
  <div className="loader-overlay">
    <Loader type="login" apiDone={apiDone}/>
  </div>
)}
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand / Welcome panel (left on desktop, stacked on mobile) */}
        {/* <aside className="brand-panel">
          <img src={image} alt="Logo" className="brand-logo" />
          <h1>Welcome back</h1>
          <p className="brand-sub">
            Sign in to access your dashboard and continue where you left off.
          </p>
        </aside> */}

        {/* Form panel */}
        <form className="form-panel" onSubmit={handlelogin}>
          <div className="form-header">
            {/* <img src={image} alt="Logo" className="form-logo" /> */}
            <h2>Sign in</h2>
          </div>

{/*           <div className="social-row" aria-label="Social options">
            <button type="button" className="social-btn" title="Facebook"><FontAwesomeIcon icon={faFacebook} /></button>
            <button type="button" className="social-btn" title="Twitter"><FontAwesomeIcon icon={faTwitter} /></button>
            <button type="button" className="social-btn" title="LinkedIn"><FontAwesomeIcon icon={faLinkedin} /></button>
            <button type="button" className="social-btn" title="GitHub"><FontAwesomeIcon icon={faGithub} /></button>
          </div>

          <div className="divider"><span>or</span></div> */}

          <label className="field">
            <span className="field-label"><FontAwesomeIcon icon={faEnvelope} /> E mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email"
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
            <Link to="/user/forgot" className="link">Forgot password?</Link>
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
      </>
  );
};

export default Login;
