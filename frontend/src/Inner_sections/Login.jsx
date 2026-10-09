  import React, { useState } from 'react';
  import '../Page_styles/Login.css';
  import { Link, useNavigate } from 'react-router-dom';
  import {
  FiLogIn,
  FiMail,
  FiLock,
  FiArrowRight,
  FiArrowUpRight,
} from "react-icons/fi";
  // import image from '../Images/logo.png';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { faFacebook, faTwitter, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
  import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
  import AuthService from '../Services/AuthService';
  import ThemeSwal from '../utils/swalTheme';
  import Loader from "../Components/Loader";
  import { useSubscription } from '../Context/SubscriptionContext';
  import { Helmet } from 'react-helmet-async';
  import { useOrganization } from '../Context/OrganizationContext';
  const Login = ({ setProfileUser }) => {
    const {setOrganization } = useOrganization();
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
          user: response.user,
          organization: response.organization,
        })
      );
      setOrganization(response.organization);
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

  navigate("/dashboard");
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
  content="Login to AssetPegasus to manage hardware assets, software licenses, warranties, maintenance schedules, and business inventory from one platform."
/>

<meta
  property="og:url"
  content="https://assetpegasus.com/user/login/"
/>

<meta
  property="og:image"
  content="https://assetpegasus.com/images/Login.webp"
/>

<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta
  name="twitter:title"
  content="Login | AssetPegasus"
/>

<meta
  name="twitter:description"
  content="Login to AssetPegasus to manage hardware assets, software licenses, warranties, maintenance schedules, and business inventory from one platform."
/>

<meta
  name="twitter:image"
  content="hhttps://assetpegasus.com/images/Login.webp"
/>
      </Helmet>

    {/* {loading && (
    <div className="loader-overlay">
      <Loader type="login" apiDone={apiDone}/>
    </div>
  )} */}

  <div className="auth-page login-page">

    {/* SEO / INTERNAL NAVIGATION */}
    <nav className="seo-links" aria-label="Related pages">
      <Link to="/">Home</Link>
      <Link to="/user/signup/">Create Account</Link>
      <Link to="/affiliate/apply/">
        Affiliate Program
      </Link>
    </nav>

    <div className="auth-card">

      <form
        className="form-panel"
        onSubmit={handlelogin}
      >

        {/* FORM HEADER */}
        <div className="form-header">
          <div className="form-heading-icon">
            <FiLogIn />
          </div>

          <div className="form-heading-text">
            <h1>Welcome Back</h1>
            <p className="form-sub">
              Sign in to access your AssetPegasus dashboard.
            </p>
          </div>
        </div>

        {/* EMAIL */}
        <label className="field">
          <span className="field-label">
            Email Address
          </span>

          <div className="input-wrapper">
            <FiMail className="input-icon" />

            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              autoComplete="email"
              required
            />
          </div>
        </label>

        {/* PASSWORD */}
        <label className="field">
          <span className="field-label">
            Password
          </span>

          <div className="input-wrapper">
            <FiLock className="input-icon" />

            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>
        </label>

        {/* FORGOT PASSWORD */}
        <div className="form-extra">
          <Link
            to="/user/forgot"
            className="link forgot-link"
          >
            Forgot Password?
            <FiArrowUpRight />
          </Link>
        </div>

        {/* SUBMIT */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-spinner" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <FiArrowRight />
              </>
            )}
          </button>
        </div>

        {/* SIGNUP LINK */}
        <div className="form-switch">
          <span>Don't have an account?</span>

          <Link to="/user/signup">
            Create Account
          </Link>
        </div>

        {/* TERMS */}
        <p className="tiny-note">
          By continuing, you agree to our{" "}
          <a
            href="https://socialflylive.com/terms-and-conditions/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms &amp; Privacy Policy
          </a>
          .
        </p>

      </form>
    </div>
  </div>

        </>
    );
  };

  export default Login;
