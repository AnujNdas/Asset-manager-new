import React, { useState } from 'react';
import '../Page_styles/Login.css'; // Reuse same styles
import { Link, useNavigate } from 'react-router-dom';
import image from '../Images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faLock, faPerson } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import AuthService from '../Services/AuthService';

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await AuthService.signup(email, username, password); // <-- call API
      await Swal.fire({
        title: "Success!",
        text: res.message || "Account created successfully!",
        icon: "success",
        customClass: {
          container: 'custom-swal-container'
        },
        confirmButtonText: "OK",
        allowOutsideClick: false
      })
      navigate("/User/Login");
      // Navigate only AFTER SweetAlert closes

    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Signup failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand panel */}
        <aside className="brand-panel">
          <img src={image} alt="Logo" className="brand-logo" />
          <h1>Join Us</h1>
          <p className="brand-sub">
            Create your account and start exploring our dashboard.
          </p>
        </aside>

        {/* Form panel */}
        <form className="form-panel" onSubmit={handleSignup}>
          <div className="form-header">
            {/* <img src={image} alt="Logo" className="form-logo" /> */}
            <h2>Create Account</h2>
            <p className="form-sub">Fill in your details to get started</p>
          </div>

          <div className="social-row">
            <button type="button" className="social-btn"><FontAwesomeIcon icon={faFacebook} /></button>
            <button type="button" className="social-btn"><FontAwesomeIcon icon={faTwitter} /></button>
            <button type="button" className="social-btn"><FontAwesomeIcon icon={faLinkedin} /></button>
            <button type="button" className="social-btn"><FontAwesomeIcon icon={faGithub} /></button>
          </div>

          <div className="divider"><span>or</span></div>

          {/* <label className="field">
            <span className="field-label"><FontAwesomeIcon icon={faUser} /> Full Name</span>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
          </label> */}

          <label className="field">
            <span className="field-label"><FontAwesomeIcon icon={faPerson} /> username</span>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" required />
          </label>

          <label className="field">
            <span className="field-label"><FontAwesomeIcon icon={faEnvelope} /> Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          </label>

          <label className="field">
            <span className="field-label"><FontAwesomeIcon icon={faLock} /> Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required />
          </label>

          {/* <label className="field">
            <span className="field-label"><FontAwesomeIcon icon={faLock} /> Confirm Password</span>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required />
          </label> */}

          <div className="form-actions">
            <Link to="/login" className="link">Already have an account?</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Signing up…" : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
