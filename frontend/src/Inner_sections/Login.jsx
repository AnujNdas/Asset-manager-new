  import React, { useState } from 'react';
  import '../Page_styles/Login.css';
  import { Link, useNavigate } from 'react-router-dom';
  // import image from '../Images/logo.png';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { faFacebook, faTwitter, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
  import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
  import AuthService from '../Services/AuthService';
  import ThemeSwal from '../utils/swalTheme';
  import Loader from "../Components/Loader";
  import { useSubscription } from '../Context/SubscriptionContext';
  import { Helmet } from 'react-helmet-async';
  const Login = ({ setProfileUser }) => {
  const { refreshSubscription } = useSubscription();

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
      console.log("Login response:", response);

      if (!response.success || !response.token || !response.user) {
        throw new Error("Invalid login response");
      }

      // ✅ STORE AUTH IN ONE PLACE, ONE FORMAT
      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: response.token,
          user: response.user
        })
      );

      ThemeSwal.fire({
        title: "Success",
        text: "Login successful",
        icon: "success",
        confirmButtonText: "OK",
      });

      setApiDone(true);
      setLoading(false);

      // ✅ SINGLE, CORRECT REDIRECT
const role = response.user.role;
if (role === "super-admin") {

  navigate("/super-admin/dashboard");

} else if (role === "affiliate") {

  navigate("/affiliate/dashboard");

} else if (
  !response.user
    .organizationOnboardingCompleted
) {

  navigate("/onboarding");

} else {

  await refreshSubscription();

  navigate("/panel");
}

    } catch (error) {
      console.error("Login error:", error);

      ThemeSwal.fire({
        title: "Error",
        text: error.response?.data?.error || "Login failed",
        icon: "error"
      });

      setLoading(false);
    }
  };

    return (
      <>
      <Helmet>
        <title>Login | AssetPegasus</title>

<meta
  name="description"
  content="Login to AssetPegasus to manage hardware assets, software licenses, warranties, maintenance schedules, and business inventory from one platform."
/>

        <link
          rel="canonical"
          href="https://assetpegasus.com/user/login/"
        />

        <meta property="og:title" content="Login | AssetPegasus" />

        <meta
          property="og:description"
          content="Login to your AssetPegasus account."
        />

        <meta
          property="og:url"
          content="https://assetpegasus.com/user/login"
        />
        <meta name="twitter:card" content="summary_large_image" />

<meta
  name="twitter:title"
  content="AssetPegasus"
/>

<meta
  name="twitter:description"
  content="Track hardware, software, licenses and machinery."
/>

<meta
  name="twitter:image"
  content="https://assetpegasus.com/images/Logo.png"
/>
      </Helmet>

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
              By continuing, you agree to our <a href="https://socialflylive.com/terms-and-conditions/" style={{color : "#DFD0B8", cursor : "pointer", textAlign : "center" , justifyContent : "center"}} target="_blank">Terms & Privacy Policy.</a> 
            </p>
          </form>
        </div>
      </div>
        </>
    );
  };

  export default Login;
