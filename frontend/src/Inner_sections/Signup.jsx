import React, { useState } from 'react';
import '../Page_styles/Login.css'; // Reuse same styles
import { Link, useNavigate } from 'react-router-dom';
import image from '../Images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const Signup = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  // const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // Replace with your actual signup API call
      await new Promise(res => setTimeout(res, 1000));

      Swal.fire("Success", "Account created successfully!", "success");
      navigate("/Login");
    } catch (err) {
      Swal.fire("Error", "Signup failed. Please try again.", "error");
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
            <img src={image} alt="Logo" className="form-logo" />
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
            <span className="field-label"><FontAwesomeIcon icon={faEnvelope} /> Name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Your Name" required />
          </label>

          <label className="field">
            <span className="field-label"><FontAwesomeIcon icon={faUser} /> Username</span>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" required />
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
