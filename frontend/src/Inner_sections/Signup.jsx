import React, { useState , useEffect } from 'react';
import '../Page_styles/Login.css';
import { Link, useNavigate , useSearchParams } from 'react-router-dom';
// import image from '../Images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faLock, faPerson } from '@fortawesome/free-solid-svg-icons';
import ThemeSwal from '../utils/SwalTheme';
import AuthService from '../Services/AuthService';
import {
  trackAffiliateVisit,
} from "../Services/AffiliateServices";
const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passwordValid, setPasswordValid] = useState(true);
useEffect(() => {

  console.log(
    "🔥 Signup page mounted"
  );

  console.log(
    "Current URL:",
    window.location.href
  );

  console.log(
    "Search params:",
    Object.fromEntries(
      [...searchParams]
    )
  );

  const setupAffiliate =
    async () => {

      /* =========================
         INVITE TRACKING
      ========================= */

      const invite =
        searchParams.get(
          "invite"
        );

      console.log(
        "Invite token:",
        invite
      );

      if (invite) {

        localStorage.setItem(
          "inviteToken",
          invite
        );

        console.log(
          "✅ Invite token saved"
        );
      }

      /* =========================
         AFFILIATE TRACKING
      ========================= */

      const affiliateRef =
        searchParams.get("ref");

      console.log(
        "Affiliate ref:",
        affiliateRef
      );

      if (!affiliateRef) {

        console.warn(
          "❌ No affiliate ref found in URL"
        );

        return;
      }

      localStorage.setItem(
        "affiliateRef",
        affiliateRef
      );

      console.log(
        "✅ Affiliate ref saved to localStorage"
      );

      try {

        console.log(
          "🚀 Calling trackAffiliateVisit..."
        );

        const response =
          await trackAffiliateVisit(
            affiliateRef
          );

        console.log(
          "✅ Affiliate tracked successfully"
        );

        console.log(
          "Track response:",
          response
        );

        console.log(
          "Cookies after tracking:",
          document.cookie
        );

      } catch (err) {

        console.error(
          "❌ Affiliate tracking failed"
        );

        console.error(
          "Error object:",
          err
        );

        console.error(
          "Response:",
          err?.response
        );

        console.error(
          "Response data:",
          err?.response?.data
        );
      }
    };

  setupAffiliate();

}, [searchParams]);
  const strongPasswordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{8,}$/;
  const handleSignup = async (e) => {
    e.preventDefault();

if (!username || !email || !password) {
  ThemeSwal.fire("Error", "All fields are required", "error");
  return;
}

if (!strongPasswordRegex.test(password)) {
  ThemeSwal.fire(
    "Weak Password",
    "Password must contain at least 8 characters including uppercase, lowercase, number, and special character.",
    "warning"
  );
  return;
}

    setLoading(true);

    try {
      // Step 1: Send OTP
      const res = await AuthService.sendOtp(email);
      if (res.success) {
        // Step 2: Ask for OTP via SweetAlert
        const { value: otp } = await ThemeSwal.fire({
          title: "Email Verification",
          text: `Enter the 6-digit OTP sent to ${email}`,
          input: "text",
          inputPlaceholder: "Enter 6-digit OTP",
          showCancelButton: true,
          confirmButtonText: "Verify OTP",
            customClass: {
            confirmButton: "my-confirm-btn",
            cancelButton: "my-cancel-btn"
          },

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
          otp,
          localStorage.getItem("inviteToken")
        );

            console.log("VERIFY RESPONSE:", verifyRes);

if (verifyRes.success && verifyRes.user) {
await ThemeSwal.fire({
  title: "Account Created",

  text: verifyRes.user.organizationOnboarded
    ? "Your account is ready."
    : "Let’s set up your workspace.",

  icon: "success",

  confirmButtonText: "Continue",

  allowOutsideClick: false,

  customClass: {
    confirmButton: "my-confirm-btn",
    cancelButton: "my-cancel-btn"
  },
});
  localStorage.setItem(
  "auth",
  JSON.stringify({
    token: verifyRes.token,
    user: verifyRes.user
  })
);

localStorage.removeItem("inviteToken");


if (!verifyRes.user.organizationOnboarded) {

  navigate("/onboarding");

} else {

  navigate("/classification", {
    state: {
      startGuide: true,
    },
  });

}
} else {
  ThemeSwal.fire(
    "Error",
    verifyRes.error || "Signup failed",
    "error"
  );
}


        } catch (err) {
          ThemeSwal.fire(
            "Error",
            err.response?.data?.error || "Something went wrong while verifying OTP",
            "error"
          );
        }
      }
    } else {
      ThemeSwal.fire("Error", res.error || "Failed to send OTP", "error");
    }
  } catch (err) {
    ThemeSwal.fire("Error", err.response?.data?.error || "Something went wrong", "error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand panel */}
        {/* <aside className="brand-panel">
          <img src={image} alt="Logo" className="brand-logo" />
          <h1>Join Us</h1>
          <p className="brand-sub">
            Create your account and start exploring our dashboard.
          </p>
        </aside> */}

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
            <input type="password" value={password} onChange={(e) => {
  const value = e.target.value;
  setPassword(value);
  setPasswordValid(strongPasswordRegex.test(value));
}} placeholder="Create a password" required />
{!passwordValid && password.length > 0 && (
  <small className="password-error">
    Weak password
  </small>
)}
<small className="password-hint">
Must contain 8+ characters, uppercase, lowercase, number and special character.
</small>
          </label>

          <div className="form-actions">
            <Link to="/user/login" className="link">Already have an account?</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </div>
                    <p className="tiny-note">
            By continuing, you agree to our <a href="https://socialflylive.com/terms-and-conditions/" style={{color : "#DFD0B8", cursor : "pointer", textAlign : "center" , justifyContent : "center", padding : "0px"}} target="_blank">Terms & Privacy Policy.</a> 
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
