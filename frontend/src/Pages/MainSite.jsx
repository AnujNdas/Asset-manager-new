import "../Page_styles/MainSite.css";
import { useState , useEffect } from "react";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Helmet } from "react-helmet-async";


import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGoogle,
  FaPinterestP,
} from "react-icons/fa";
import {
  faClipboard,
  faLineChart,
  faClipboardCheck,
  faRestroom,
  faTrain,
  faKitchenSet,
} from "@fortawesome/free-solid-svg-icons";
import { FiBox, FiMonitor } from "react-icons/fi";
const LandingPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [active, setActive] = useState(0);
  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  const navigate = useNavigate()
  const handleSigninClick = () => {
    navigate("/user/login")
  }
  const handleSignupClick = () => {
    navigate("/user/signup")
  }
const handleAboutClick = () => {
  window.open("https://socialflylive.com/about/", "_blank");
};
const handleHealthCare = () => {
  window.open("https://socialflylive.com/healthcare-asset-tracking/")
}
const handleManufacturing = () => {
  window.open("https://socialflylive.com/manufacturing-asset-management-software/")
}
const handleEducation = () => {
  window.open("https://socialflylive.com/education-asset-management/")
}
const handleConstructionClick = () => {
  window.open("https://socialflylive.com/construction-equipment-tracking/")
}
const handleTravelClick = () => {
  window.open("https://socialflylive.com/travel-transportation-asset-management/")
}
const handleHospitalityManagement = () => {
  window.open("https://socialflylive.com/restaurant-hospitality-asset-management/")
}
const handleProductClick = () => {
  window.open("https://socialflylive.com/it-asset-management-itam-software/")
}
const handleProductClick2 = () => {
  window.open("https://socialflylive.com/machinery-assets-management/")
}

  const headings = [
    "Manage All types of Assets From One Place — Hardware, Software & Cloud.",
    "No Tracking — Privacy Policy.",
    "Instant Asset Insights/Reports that Scale with Business.",
    "Track Maintenance, Warranty & Insurance",
  ];
const showcaseImages = [
  "/images/healthcare.webp",
  "/images/construction.webp",
  "/images/info.webp",
];
const [currentSlide, setCurrentSlide] = useState(0);
const [transitionEnabled, setTransitionEnabled] = useState(true);
const slides = [...showcaseImages, showcaseImages[0]];
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) => prev + 1);
  }, 3000);

  return () => clearInterval(interval);
}, []);
useEffect(() => {
  if (currentSlide === showcaseImages.length) {
    const timeout = setTimeout(() => {
      setTransitionEnabled(false);
      setCurrentSlide(0);

      setTimeout(() => {
        setTransitionEnabled(true);
      }, 50);
    }, 800);

    return () => clearTimeout(timeout);
  }
}, [currentSlide]);
const nextSlide = () => {
  setCurrentSlide((prev) => (prev + 1) % showcaseImages.length);
};

const prevSlide = () => {
  setCurrentSlide(
    (prev) => (prev - 1 + showcaseImages.length) % showcaseImages.length
  );
};
  const faqData = [
    {
      question: "Why do businesses need asset tracking software?",
      answer:
        "Asset tracking software helps organizations monitor assets, reduce losses, improve accountability, streamline audits, and optimize maintenance schedules.",
    },
    {
      question: "How does asset lifecycle management improve operations?",
      answer:
        "Lifecycle management gives complete visibility into procurement, deployment, maintenance, upgrades, and retirement of assets, reducing operational costs.",
    },
    {
      question:
        "Can asset management software track assets across multiple locations?",
      answer:
        "Yes. AssetPegasus provides centralized visibility for assets across offices, warehouses, branches, and remote sites.",
    },
    {
      question: "What is asset management software?",
      answer:
        "Asset management software is a platform used to track, manage, monitor, and optimize physical and digital assets throughout their lifecycle.",
    },
    {
      question: "What is AssetPegasus?",
      answer:
        "AssetPegasus is a cloud-based asset management platform that helps businesses manage hardware, software, machinery, equipment, licenses, insurance, maintenance, and more from a single dashboard.",
      },
      {
        question: "What's the best asset management software with insurance tracking?",
        answer:
          "AssetPegasus is a cloud-based asset management platform that helps businesses manage hardware, software, machinery, equipment, licenses, insurance, maintenance, and more from a single dashboard.",
      },
      {
        question: "What's a good Asset Panda alternative for mid-market companies?",
        answer:
          "AssetPegasus is a cloud-based asset management platform that helps businesses manage hardware, software, machinery, equipment, licenses, insurance, maintenance, and more from a single dashboard.",
      },
      {
        question: "What's cheaper than ServiceNow for IT asset management?",
        answer:
          "AssetPegasus is a cloud-based asset management platform that helps businesses manage hardware, software, machinery, equipment, licenses, insurance, maintenance, and more from a single dashboard.",
      },
  ];
const leftItems = [
  "💻 User End Devices",
  "🔒 Security & Safety",
  "🏭 Machinery",
  "🤖 Robotics",
];

const rightItems = [
  "🚚 Transport",
  "🛠 Equipment & Tools",
  "📍 Electronics",
  "🎧 Accessories",
];
const leftItemssoftware = [
  "💻Operating System",
  "🔒 SaaS (Software As a Service)",
  "🖧 Server & Cloud",
  "💿 Desktop Applications",
];

const rightItemssoftware = [
  "🧩 Digital Accessories",
  "✏️ Creative & Design",
  "🏛️ Enterprise System",
  "📊 Data & Infrastucture",
];
  const features = [
    {
      label: "Annual Cost (Top Plan)",
      c1: "$18,000-$100,000+/year",
      ap: "$768-$960/year",
      c2: "$5,500-$6,000/year",
    },
    {
      label: "Maintenance Scheduling",
      c1: "Standard Workflows",
      ap: "Full Advanced Scheduling",
      c2: "Basic Workflows",
    },
    {
      label: "Insurance Tracking",
      c1: "Custom Setup",
      ap: "Included",
      c2: "Not Available",
    },
    {
      label: "Cloud Asset Management",
      c1: "Partial Visibility",
      ap: "Unified Visibility",
      c2: "Not Available",
    },
    {
      label: "HIPAA Support",
      c1: "Limited Support",
      ap: "Supported",
      c2: "Not Available",
    },
    {
      label: "GDPR Support",
      c1: "Partial Support",
      ap: "Supported",
      c2: "Not Available",
    },
    {
      label: "Multi Location Tracking",
      c1: "Standard",
      ap: "Advanced",
      c2: "Limited",
    },
    {
      label: "Software License Tracking",
      c1: "Included",
      ap: "Advanced Visibility",
      c2: "Limited",
    },
    {
      label: "Machinery Management",
      c1: "Limited Support",
      ap: "Full Support",
      c2: "Basic Tracking",
    },
  ];
  const impacts = [
    {
      title: "Reduce IT Costs by Up to 40%",
      description:
        "AssetPegasus helps organizations eliminate waste by providing accurate visibility into software licenses, hardware utilization and cloud resource consumption. Companies often discover unused licenses and idle assets within the first month of implementation, significantly reducing operational costs.",
    },
    {
      title: "Improve Asset Visibility",
      description:
        "Gain complete visibility into every asset across locations, departments and employees. Track lifecycle, ownership and utilization from one centralized dashboard.",
    },
    {
      title: "Increase Team Productivity",
      description:
        "Reduce manual tracking, paperwork and spreadsheets. Teams spend less time searching for assets and more time focusing on business operations.",
    },
    {
      title: "Enhance Compliance",
      description:
        "Maintain audit-ready records, monitor renewals and track regulatory requirements such as GDPR, HIPAA and internal governance policies.",
    },
    {
      title: "Reduce Security Risks",
      description:
        "Identify untracked assets, expired software, unsupported devices and compliance gaps before they become security vulnerabilities.",
    },
  ];
  
  const featuresSpecial = [
    "☁️ Cloud, Hybrid & On Premise Deployment Options.",
    "🛡️ GDPR & HIPAA Compliant.",
    "💳 No Credit Card Required. Start with 7 Days Free Trial.",
    "🎯 Track Every Single Asset Across Its Full Lifecycle.",
    "🚨 Proactive Alerts for Security Risks, Expirations & Changes.",
    "🤖 Automate License Reporting and Renewals.",
    "⏱️ Unlock Modern Inventory & Best Visibility.",
  ];
  
  return (
    <>
    <Helmet>
  <title>
    AssetPegasus | IT Asset Management Software
  </title>

  <meta property="og:type" content="website" />
  <meta
    name="description"
    content="Track hardware, software licenses, maintenance schedules, warranties, insurance policies and asset lifecycle."
  />

  <meta
    property="og:title"
    content="AssetPegasus Asset Management System"
  />

  <meta
    property="og:description"
    content="Manage hardware, software, maintenance, warranties and insurance from one platform."
  />

  <meta
    property="og:image"
    content="https://assetpegasus.com/images/assets.png"
  />

  <link
    rel="canonical"
    href="https://assetpegasus.com/"
  />
</Helmet>
    <div className="landing-page">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <img src="/images/Logo2.png" alt="AssetPegasus Logo" height="150" />
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
          Track Every IT Asset, Software License, and Machinery 
          </h1>

          <h2>
          Stop losing money on Zombie SaaS subscriptions and untracked hardware.
          </h2>
          <p>Assetpegasus unites your physical and digital assets so you stay compliant and cut overhead by up to 40%.</p>

          <div className="hero-buttons">
            <button className="signup-btn" onClick={handleSignupClick}>
              Try For Free →
            </button>

            <button className="account-btn">
              Explore Features
            </button>
          </div>
        </div>

        <div className="hero-images">

          <img
            src="/images/AssetpegasusDashboard.webp"
            alt="IT Infrastructure"
          />

        </div>

      </section>
      <section className="asset-showcase">
        <div className="asset-showcase-information">
           <h2 className="asset-showcase-title">
          Asset Management Software to Track and Manage Every Asset
        </h2>
        <p>Assetpegasus provides a powerful asset management software platform that helps organizations track equipment, monitor asset lifecycle data, manage inventory, and automate maintenance workflows from one centralized system. Gain real time visibility into your assets, reduce operational downtime, and maintain complete control over resources across departments and locations.</p>

          </div>
      <div className="asset-showcase-container">
       
          <h2>AssetPegasus
Machine & IT asset lifecycle management platform (Asset Management System)</h2>
        <div className="asset-showcase-content">
          {/* Left Side */}
          <div className="asset-showcase-left">
            <ul className="asset-feature-list">
              {headings.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <button className="asset-showcase-btn" onClick={handleSignupClick}>
              Free Trial
            </button>
          </div>

          {/* Right Side */}
<div className="asset-showcase-right">
<div className="showcase-slider">
<div
  className="slider-track"
  style={{
    transform: `translateX(-${currentSlide * 100}%)`,
    transition: transitionEnabled
      ? "transform 0.8s ease-in-out"
      : "none",
  }}
>
  {slides.map((image, index) => (
    <img
      key={index}
      src={image}
      alt={`Slide ${index + 1}`}
      className="showcase-image"
    />
  ))}
</div>
</div>
</div>
        </div>
      </div>
    </section>
      <section className="asset-info-section">
      <div className="asset-info-container">

        <h2 className="asset-info-title">
          Complete Asset Tracking System
        </h2>

        <p className="asset-info-text">
          In 2026 Organizations manage hundreds or thousands of assets
          including computers, laptops, tablets, mobile devices,
          machinery, tools, operational equipment with transport assets
          and all Digital Assets like Softwares, Domains, SSL
          certificates & much more. Without proper tracking systems,
          it becomes difficult for businesses to know where assets are
          located, how they are being used and other valuable information.
        </p>

        <p className="asset-info-text">
          Asset tracking software helps organizations monitor asset
          renewals, maintenance dates, insurance policies, locations,
          assigned personnel, and status across their entire organization.
        </p>

        <p className="asset-info-text">
          AssetPegasus provides a centralized asset tracking platform
          that allows organizations to monitor assets from a single
          dashboard. Using technologies such as QR codes and mobile
          tracking, teams can update asset records, locate assets and
          track them in real time.
        </p>

      </div>
    </section>
    <section className="impact-section">
      <div className="impact-container">

        {/* LEFT SIDE */}
        <div className="impact-left">

          <h2>Best Features</h2>

          <div className="feature-list">
            {featuresSpecial.map((item, index) => (
              <div key={index} className="feature-item">
                {item}
              </div>
            ))}
          </div>

          <button className="trial-btn" onClick={handleSignupClick}>
            Free Trial
          </button>

        </div>

        {/* RIGHT SIDE */}
        <div className="impact-right">

          <h2>
            The Business Impact of AssetPegasus
          </h2>

          <p className="impact-subtitle">
            AssetPegasus does not just improve IT operations,
            it delivers measurable business outcomes that
            affect the entire organization.
          </p>

          <div className="impact-card">

            <h3>
              {impacts[active].title}
            </h3>

            <p>
              {impacts[active].description}
            </p>

          </div>

          <div className="impact-dots">
  {impacts.map((_, index) => (
    <button
      key={index}
      className={`dot ${active === index ? "active" : ""}`}
      onClick={() => setActive(index)}
      aria-label={`View impact slide ${index + 1}`}
      aria-current={active === index ? "true" : "false"}
    />
  ))}
</div>
        </div>

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
      <section className="cloud-machinery-section">
      <div className="cloud-machinery-container">

        <h2 className="cloud-machinery-title">
          Cloud Based Machinery Assets Management — Access From Anywhere
        </h2>

        <p className="cloud-machinery-text">
          <strong>AssetPegasus</strong> is a hardware management system that is a
          fully cloud based solution. No software needs to be installed on the
          local machines, no servers to be maintained and no data to be backed
          up manually.
        </p>

        <p className="cloud-machinery-text">
          Your whole inventory of hardware assets can be accessed from any
          location, anywhere in the world, under the protection of any device
          and providing distributed teams, remote IT directors, and
          organizations with multiple sites equal access as a one-office team.
        </p>

      </div>
    </section>
      <section className="hardware-section">

<h2 className="hardware-title">
  Manage All Types Of Hardwares
</h2>

<div className="hardware-content">

  {/* LEFT */}
  <div className="hardware-column">
    {leftItems.map((item, index) => (
      <div key={index} className="hardware-item">
        {item}
      </div>
    ))}
  </div>

  {/* CENTER */}
<div className="hardware-image-card">
  <video
    autoPlay
    muted
    loop
    playsInline
    className="hardware-video"
  >
    <source src="/videos/hardware.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</div>

  {/* RIGHT */}
  <div className="hardware-column">
    {rightItems.map((item, index) => (
      <div key={index} className="hardware-item">
        {item}
      </div>
    ))}
  </div>

</div>

</section>
<section className="product-features-section">
      <div className="product-features-container">

        <h2 className="product-features-title">
          Product Features
        </h2>

        <div className="product-features-grid">

          {/* IT Assets */}
          <div className="feature-card" onClick={handleProductClick}>
            <div className="feature-icon">
              <FiBox />
            </div>

            <h3>IT Asset Management</h3>

            <p>
              Manage All types of Digital Assets From One Place —
              <strong> Softwares, Servers, Domains & Clouds</strong> etc.
            </p>
          </div>

          {/* Equipment Assets */}
          <div className="feature-card" onClick={handleProductClick2}>
            <div className="feature-icon">
              <FiMonitor />
            </div>

            <h3>Equipment Asset Management</h3>

            <p>
              Manage All types of Physical Assets From One Place —
              <strong> Machine, Equipment, Electronics & Transport</strong>
              {" "}assets etc.
            </p>
          </div>

        </div>

      </div>
    </section>
      {/* FEATURES */}

      <section className="features">

        <h2>
          Soluition For Every Industry
        </h2>
        <p>Different industries manage assets in different ways. Socialfly provides flexible asset management solutions that adapt to the needs of various industries. </p>

        <div className="feature-grid">

          <div className="feature-card" onClick={handleHealthCare}>
            <span><FontAwesomeIcon icon={faLineChart} /></span>
            <h3>Healthcare Asset Tracking</h3>
            <p>
            Track critical medical devices, diagnostic equipment, and IT systems.
            </p><p> Maintain regulatory compliance and ensure patient-care equipment is always maintained, covered, and accounted for.
→ Healthcare Asset Tracking
            </p>
          </div>

          <div className="feature-card" onClick={handleManufacturing}>
            <span><FontAwesomeIcon icon={faClipboard}/></span>
            <h3>Manufacturing Asset Management</h3>
            <p>
           Manage production machinery, tools, and operational equipment across factory floors and multiple facilities.</p> <p> Track maintenance cycles and insurance coverage on high-value equipment.
            </p>
          </div>

          <div className="feature-card" onClick={handleEducation}>
            <span><FontAwesomeIcon icon={faClipboardCheck} /></span>
            <h3>Education Asset Management</h3>
            <p>
            From campus IT labs to sports equipment and classroom tech — manage assets across multiple campuses, assign to departments, and track renewal cycles all in one platform.
            </p>
          </div>

          <div className="feature-card" onClick={handleHospitalityManagement}>
            <span><FontAwesomeIcon icon={faRestroom} /></span>
            <h3>Restaurant & Hospitality Asset Management </h3>
            <p>
            Track kitchen equipment, POS systems, HVAC units, and furniture across multiple locations.</p> <p> Prevent costly equipment failures with proactive maintenance and warranty management.
            </p>
          </div>

          <div className="feature-card" onClick={handleConstructionClick}>
            <span><FontAwesomeIcon icon={faKitchenSet} /></span>
            <h3>Construction Equipment Tracking</h3>
            <p>Heavy equipment moves between job sites. Know where every piece of machinery is, when it's due for service, and whether it's covered — before you move it or need to claim it. 
            </p>
          </div>

          <div className="feature-card" onClick={handleTravelClick}>
            <span><FontAwesomeIcon icon={faTrain} /></span>
            <h3>Travel & Transportation Logistics</h3>
            <p>
              Manage fleets, ground equipment, and transit infrastructure. </p> <p>Real-time visibility into vehicle status, service schedules, and insurance policies — all in one dashboard.
            </p>
          </div>

        </div>
      </section>
      <section className="hardware-section">

<h2 className="hardware-title">
  Manage All Types Of Softwares
</h2>

<div className="hardware-content">

  {/* LEFT */}
  <div className="hardware-column">
    {leftItemssoftware.map((item, index) => (
      <div key={index} className="hardware-item">
        {item}
      </div>
    ))}
  </div>

  {/* CENTER */}
<div className="hardware-image-card">
  <video
    autoPlay
    muted
    loop
    playsInline
    className="hardware-video"
  >
    <source src="/videos/software.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</div>

  {/* RIGHT */}
  <div className="hardware-column">
    {rightItemssoftware.map((item, index) => (
      <div key={index} className="hardware-item">
        {item}
      </div>
    ))}
  </div>

</div>

</section>
      <section className="comparison-section">
      <div className="comparison-container">

        <h2>
          Why Businesses Choose
          <span> AssetPegasus</span>
        </h2>

        {/* DESKTOP TABLE */}
        <div className="comparison-table-wrapper">

          <div className="comparison-table">

            <div className="table-head">
              <div>Features</div>
              <div>Competitor 1</div>
              <div className="pegasus-col">
                AssetPegasus
              </div>
              <div>Competitor 2</div>
            </div>

            {features.map((item, index) => (
              <div
                className="table-row"
                key={index}
              >
                <div className="feature-name">
                  {item.label}
                </div>

                <div>{item.c1}</div>

                <div className="pegasus-col">
                  {item.ap}
                </div>

                <div>{item.c2}</div>
              </div>
            ))}
          </div>

        </div>

        {/* MOBILE CARDS */}
        <div className="comparison-mobile">

          <div className="mobile-card">
            <h3>Competitor 1</h3>

            {features.map((item, index) => (
              <div key={index} className="mobile-row">
                <span>{item.label}</span>
                <strong>{item.c1}</strong>
              </div>
            ))}
          </div>

          <div className="mobile-card featured">
            <h3>AssetPegasus</h3>

            {features.map((item, index) => (
              <div key={index} className="mobile-row">
                <span>{item.label}</span>
                <strong>{item.ap}</strong>
              </div>
            ))}
          </div>

          <div className="mobile-card">
            <h3>Competitor 2</h3>

            {features.map((item, index) => (
              <div key={index} className="mobile-row">
                <span>{item.label}</span>
                <strong>{item.c2}</strong>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
    <section className="about-contact-section">
      {/* TOP SECTION */}
      <div className="about-section-content">
        <h2 className="about-main-title">
          8+ Years of Building Digital Success Stories.
        </h2>

        <p className="about-text">
          Small, Medium & Big Organizations require a simple flexible and
          scalable asset management platform which capable of managing complex
          asset environments.
        </p>

        <p className="about-text">
          <span className="highlight-link">
            HAM & ITAM
          </span>{" "}
          we bring all that expertise into a single SaaS (Software as Service)
          platform that helps to Manage Businesses & Individuals.
        </p>

        <p className="about-text">
          Recognition by a trusted research platform like{" "}
          <span className="highlight-link">Goodfirms</span>,{" "}
          <span className="highlight-link">G2</span>,{" "}
          <span className="highlight-link">Saashub</span>,{" "}
          <span className="highlight-link">Product Hunt</span>,{" "}
          <span className="highlight-link">SourceForge</span> & Others
        </p>

        <button className="about-btn" onClick={handleAboutClick}>
          About Us
        </button>
      </div>

      {/* CONTACT SECTION */}
      <div className="contact-section">
        <h3 className="contact-title">
          Contact Us
        </h3>

        <div className="contact-buttons">
          <a
            href="https://api.whatsapp.com/send/?phone=9088665504&text&type=phone_number&app_absent=0"
            className="contact-btn"
          >
            <FaWhatsapp />  
            <span>WhatsApp</span>
          </a>

          <a
            href="https://t.me/Socialflylive"
            className="contact-btn"
          >
            <FaTelegramPlane />
            <span>Telegram</span>
          </a>
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

        <button className="signup-btn" onClick={handleSignupClick}>
        7 Days Free Trial
        </button>

      </section>
      <section className="faq-section">
      <div className="faq-container">
        <h2 className="faq-title">
          FAQ (Frequently Asked Questions)
        </h2>

        <div className="faq-list">
          {faqData.map((item, index) => (
            <div
              className={`faq-item ${
                activeIndex === index ? "active" : ""
              }`}
              key={index}
            >
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                <span className="faq-icon">
                  {activeIndex === index ? "▼" : "▶"}
                </span>

                <span>{item.question}</span>
              </button>

              <div
                className={`faq-answer ${
                  activeIndex === index ? "show" : ""
                }`}
              >
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

      {/* FOOTER */}
      <footer className="footer">
      <div className="footer-container">

        {/* Left Section */}
        <div className="contact-and-links">
        <div className="footer-column footer-left">
          <a href="https://socialflylive.com/contact/">Contact</a>

          <a href="https://socialflylive.com/about/">About Us</a>


        </div>

        {/* Center Section */}
        <div className="footer-column footer-center">
          <a href="https://socialflylive.com/terms-and-conditions/">Terms and Conditions</a>
          <a href="https://socialflylive.com/global-privacy-policy/">Global Privacy Policy</a>

        </div>

        {/* Right Section */}
        <div className="footer-column footer-right">
          <a href="https://socialflylive.com/it-asset-management-itam-software/">
            IT Asset Management Software
          </a>

          <a href="https://socialflylive.com/machinery-assets-management/">
            Machinery Assets Management Software
          </a>

                  
        </div>
        </div>
          <div className="icons-and-mails">
                      <div className="social-icons">
            <a href="https://www.facebook.com/socialflylive/" aria-label="Facebook">
              <FaFacebookF />
            </a>

            <a href="https://www.instagram.com/socialflylive" aria-label="Instagram">
              <FaInstagram />
            </a>

            <a href="https://www.linkedin.com/company/socialflylive/" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>

            <a href="https://www.google.com/maps/place/SocialTechner+%26+Socialfly/@43.932,-32.6777608,3z/data=!3m1!4b1!4m6!3m5!1s0x3a0275e10d495555:0x5fe8c0d82a4a28f!8m2!3d43.932!4d-32.6777608!16s%2Fg%2F11s8_1300s?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D" aria-label="Google Maps">
              <FaGoogle />
            </a>

            <a href="https://in.pinterest.com/socialflylive/" aria-label="Pinterest">
              <FaPinterestP />
            </a>
          </div>
          <p className="footer-email">
            Email: <a href="mailto:info@assetpegasus.com">info@assetpegasus.com</a>
          </p>
        </div>
      </div>
          <div className="copyright">
            © 2026 SOCIALFLY. All Rights Reserved.
          </div>
    </footer>

    </div>
    </>
  );
};

export default LandingPage;