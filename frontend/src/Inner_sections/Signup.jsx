import React, { useState } from 'react';
import '../Page_styles/Login.css';
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

    if (!username || !email || !password) {
      Swal.fire("Error", "All fields are required", "error");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Send OTP
      const res = await AuthService.sendOtp(email);

      if (res.success) {
        // Step 2: Ask for OTP via SweetAlert
        const { value: otp } = await Swal.fire({
          title: "Email Verification",
          text: `Enter the 6-digit OTP sent to ${email}`,
          input: "text",
          inputPlaceholder: "Enter 6-digit OTP",
          showCancelButton: true,
          confirmButtonText: "Verify OTP",
          inputValidator: (value) => {
            if (!value || value.length !== 6) {
              return "Please enter a valid 6-digit OTP";
            }
          }
        });

 if (otp) {
        try {
          // ✅ Step 3: Verify OTP & Signup in one step
          const verifyRes = await AuthService.verifyOtpAndSignup(
            email,
            username,
            password,
            otp
          );

          if (verifyRes.message) {
            await Swal.fire({
              title: "Success!",
              text: verifyRes.message || "Account created successfully!",
              icon: "success",
              confirmButtonText: "OK",
              allowOutsideClick: false
            });
            navigate("/user/login");
          } else {
            Swal.fire("Error", verifyRes.error || "Verification failed", "error");
          }
        } catch (err) {
          Swal.fire(
            "Error",
            err.response?.data?.error || "Something went wrong while verifying OTP",
            "error"
          );
        }
      }
    } else {
      Swal.fire("Error", res.error || "Failed to send OTP", "error");
    }
  } catch (err) {
    Swal.fire("Error", err.response?.data?.error || "Something went wrong", "error");
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
            <h2>Create Account</h2>
            <p className="form-sub">Fill in your details to get started</p>
          </div>

{/*           <div className="social-row">
            <button type="button" className="social-btn"><FontAwesomeIcon icon={faFacebook} /></button>
            <button type="button" className="social-btn"><FontAwesomeIcon icon={faTwitter} /></button>
            <button type="button" className="social-btn"><FontAwesomeIcon icon={faLinkedin} /></button>
            <button type="button" className="social-btn"><FontAwesomeIcon icon={faGithub} /></button>
          </div>

          <div className="divider"><span>or</span></div> */}

          <label className="field">
            <span className="field-label"><FontAwesomeIcon icon={faPerson} /> Username</span>
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

          <div className="form-actions">
            <Link to="/user/login" className="link">Already have an account?</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
