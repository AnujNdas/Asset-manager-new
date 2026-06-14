import "../Page_styles/MainSite.css";
import { useNavigate } from "react-router-dom";
const LandingPage = () => {
  const navigate = useNavigate()
  const handleSigninClick = () => {
    navigate("/user/login")
  }
  const handleSignupClick = () => {
    navigate("/user/signup")
  }
  return (
    <div className="landing-page">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          AssetManager Pro
        </div>

        <div className="nav-actions">
          {/* <button className="account-btn">
            My Account
          </button> */}

          <button className="signin-btn" onClick={handleSigninClick}>
            Sign In
          </button>

          <button className="signup-btn" onClick={handleSignupClick}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">

        <div className="hero-content">
          <h1>
            Modern IT Asset Management
            For Growing Businesses
          </h1>

          <p>
            Track hardware, software,
            licenses, warranties,
            maintenance costs and
            employee assignments from
            a single platform.
          </p>

          <div className="hero-buttons">
            <button className="signup-btn">
              Get Started
            </button>

            <button className="account-btn">
              View Demo
            </button>
          </div>
        </div>

        <div className="hero-images">

          <img
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31"
            alt="IT Infrastructure"
          />

          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
            alt="Dashboard"
          />

          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692"
            alt="IT Team"
          />

        </div>

      </section>

      {/* STATS */}

      <section className="stats">

        <div className="stat-card">
          <h2>10K+</h2>
          <p>Assets Managed</p>
        </div>

        <div className="stat-card">
          <h2>500+</h2>
          <p>Organizations</p>
        </div>

        <div className="stat-card">
          <h2>99.9%</h2>
          <p>System Uptime</p>
        </div>

        <div className="stat-card">
          <h2>24/7</h2>
          <p>Support</p>
        </div>

      </section>

      {/* FEATURES */}

      <section className="features">

        <h2>
          Everything You Need
        </h2>

        <div className="feature-grid">

          <div className="feature-card">
            <h3>Hardware Tracking</h3>
            <p>
              Track laptops, desktops,
              servers, networking devices
              and peripherals.
            </p>
          </div>

          <div className="feature-card">
            <h3>Software Management</h3>
            <p>
              Manage licenses,
              subscriptions and software
              renewals.
            </p>
          </div>

          <div className="feature-card">
            <h3>Asset Assignment</h3>
            <p>
              Assign assets to employees
              and monitor utilization.
            </p>
          </div>

          <div className="feature-card">
            <h3>Cost Tracking</h3>
            <p>
              Track purchase costs,
              maintenance and ownership
              expenses.
            </p>
          </div>

          <div className="feature-card">
            <h3>Warranty Monitoring</h3>
            <p>
              Never miss warranty
              expiration dates again.
            </p>
          </div>

          <div className="feature-card">
            <h3>Analytics</h3>
            <p>
              Powerful reports and
              lifecycle analytics.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}

      <section className="cta">

        <h2>
          Start Managing Assets
          Smarter Today
        </h2>

        <p>
          Centralize your IT inventory,
          reduce costs and improve
          operational efficiency.
        </p>

        <button className="signup-btn">
          Start Free Trial
        </button>

      </section>

      {/* FOOTER */}

      <footer className="footer">
        © 2026 AssetManager Pro.
        All Rights Reserved.
      </footer>

    </div>
  );
};

export default LandingPage;