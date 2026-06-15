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
          Asset Pegasus
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
          Asset Management Software with Insurance Tracking
          </h1>

          <h2>
          Hardware Asset Management, IT Asset Management Software, ITAM.Software, Asset Tracking Software USA
          </h2>

          <div className="hero-buttons">
            <button className="signup-btn">
              Try For Free →
            </button>

            <button className="account-btn">
              Explore Features
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
          <h2>2</h2>
          <p>Type Of Assets</p>
        </div>

        <div className="stat-card">
          <h2>100%</h2>
          <p>GDPR & HIPAA Complaint</p>
        </div>

        <div className="stat-card">
          <h2>100%</h2>
          <p>Track Full Lifecycle</p>
        </div>

        <div className="stat-card">
          <h2>2 in 1</h2>
          <p>Budget Friendly Saas</p>
        </div>

      </section>

      {/* FEATURES */}

      <section className="features">

        <h2>
          Soluition For Every Industry
        </h2>
        <p>Different industries manage assets in different ways. Socialfly provides flexible asset management solutions that adapt to the needs of various industries. </p>

        <div className="feature-grid">

          <div className="feature-card">
            <h3>Healthcare Asset Tracking</h3>
            <p>
            The healthcare industry is a dynamic and time sensitive world and every second counts. The hospital or clinic is dealing with thousands of critical assets every day, from infusion pumps and ventilators to wheelchairs, monitors, laptop computers and diagnostic equipment. Equipment may be lost, unused, and late for maintenance or in short supply when needed. Healthcare asset tracking software of today is valuable in providing a real time view of equipment, minimizing operational delays, enhancing compliance and enabling improved patient care. 

            </p>
          </div>

          <div className="feature-card">
            <h3>Manufacturing Asset Management</h3>
            <p>
            There are hundreds or thousands of assets managed by manufacturing companies every day. The availability of IT infrastructure, tools, spare parts, production equipment and machines are important to track efficiently, as are operational machines or their tools. 
            </p>
          </div>

          <div className="feature-card">
            <h3>Education Asset Management</h3>
            <p>
            Today’s education management handle so much more than a class and books. These are common components in schools, colleges, universities, and training centres that can be daily affected by their day-to-day operations including Laptop computers, Tablets, lab equipment, projectors, smart boards, library inventory, furniture, sporting goods, servers, and also facility infrastructure. Tracking and management of these assets is time consuming, inefficient and costly without a central system.  
            </p>
          </div>

          <div className="feature-card">
            <h3>Restaurant & Hospitality Asset Management </h3>
            <p>
            Speed, efficiency, consistency and amazing customer experiences are the lifeblood of the restaurant and hospitality sector. Whether it’s restaurants, cafés, hotels or resorts, they maintain hundreds of assets on a daily basis, from equipment and point of sale to refrigeration, furniture, HVAC, housekeeping and IT assets, etc. etc.
            </p>
          </div>

          <div className="feature-card">
            <h3>Construction Equipment Tracking</h3>
            <p>
              
The construction industry is in a fast-paced business with the constant movement of equipment, machinery, tools and vehicles between construction jobs, storage yards, and jobs in operation. These assets can be hard to oversee manually and quite often result in delays, lost equipment, downtime and increased operating expenses. A construction and equipment tracking can be effective in terms of complete asset visibility across the business and better productivity, safety and efficiency.
            </p>
          </div>

          <div className="feature-card">
            <h3>Travel & Transportation Logistics</h3>
            <p>
            Travel and transportation relies on a fast-paced business where efficiency, visibility and coordination in real time are essential. Over thousands of assets are being moved daily by logistics providers, fleet operators, cargo companies, public transport, travel providers and distribution systems. These include vehicles; goods containers; weather or other sensors, as well as warehouse equipment, operative tools, IT systems and maintenance systems. 
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
        7 Days Free Trial
        </button>

      </section>

      {/* FOOTER */}

      <footer className="footer">
        © 2026 AssetPegasus.
        All Rights Reserved.
      </footer>

    </div>
  );
};

export default LandingPage;