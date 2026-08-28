import React from 'react'
import "../../Page_styles/LandingPage/Healthcare.css"
import { useState , useEffect } from 'react';
import ProductFeatures from '../../Components/Mainpage/ProductFeature';
import { FaBook, FaHospital, FaToolbox } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const healthcareSlides = [
  {
    image: "/images/healthcare.webp",
    alt: "Healthcare asset management dashboard",
  },
  {
    image: "/images/info.webp",
    alt: "Healthcare asset tracking system",
  },
  {
    image: "/images/construction.webp",
    alt: "Healthcare asset management software",
  },
];

const healthcareSection6Slides = [
  {
    icon: "📈",
    title: (
      <>
        There are several key issues healthcare asset tracking
        <br />
        software can address, such as:
      </>
    ),
    text: (
      <>
        Healthcare settings are constantly changing. A constant flow of
        equipment is carried on expeditions to and between wards, ICUs,
        emergency departments, operating rooms and storage points.
        Operational inefficiencies and lack of visibility can occur when
        data is transferred and kept on multiple disconnected systems or
        in manual spreadsheets.
      </>
    ),
  },

  {
    icon: "🏥",
    title: (
      <>
        Improve Equipment
        <br />
        Visibility
      </>
    ),
    text: (
      <>
        Healthcare facilities can maintain real-time visibility into
        medical equipment, its current location, condition and availability,
        helping staff find the right equipment when it is needed.
      </>
    ),
  },

  {
    icon: "🔧",
    title: (
      <>
        Reduce Equipment
        <br />
        Downtime
      </>
    ),
    text: (
      <>
        Automated maintenance schedules and proactive alerts help
        healthcare teams identify upcoming servicing requirements before
        equipment failures interrupt critical operations.
      </>
    ),
  },

  {
    icon: "📋",
    title: (
      <>
        Simplify Compliance
        <br />
        Management
      </>
    ),
    text: (
      <>
        Maintain complete maintenance histories, inspection records and
        asset documentation to support regulatory compliance and make
        audits easier to manage.
      </>
    ),
  },

  {
    icon: "💰",
    title: (
      <>
        Control Asset
        <br />
        Costs
      </>
    ),
    text: (
      <>
        Track acquisition, maintenance, repair and replacement costs to
        identify unnecessary spending and make better equipment investment
        decisions.
      </>
    ),
  },

  {
    icon: "⚕️",
    title: (
      <>
        Improve Patient
        <br />
        Care
      </>
    ),
    text: (
      <>
        Reliable access to properly maintained medical equipment helps
        healthcare teams operate efficiently and focus on delivering
        better patient care.
      </>
    ),
  },
];

const healthcareSection5Slides = [
  {
    title: (
      <>
        Maintenance & Calibration
        <br />
        Tracking
      </>
    ),
    text: "Schedule inspections, maintenance and renewals, calibration automatically to ensure equipment is compliant and functional."
  },
  {
    title: (
      <>
        Medical Equipment
        <br />
        Tracking
      </>
    ),
    text: "Track critical medical equipment in real time and maintain complete visibility across departments."
  },
  {
    title: (
      <>
        Equipment Lifecycle
        <br />
        Management
      </>
    ),
    text: "Manage healthcare equipment from acquisition and deployment through maintenance, upgrades and retirement."
  },
  {
    title: (
      <>
        Compliance &
        <br />
        Audit Readiness
      </>
    ),
    text: "Maintain accurate asset records and generate audit-ready reports to support healthcare compliance requirements."
  },
  {
    title: (
      <>
        Asset Utilization
        <br />
        Monitoring
      </>
    ),
    text: "Identify underutilized equipment and optimize asset allocation across healthcare facilities."
  },
  {
    title: (
      <>
        Cost &
        <br />
        Maintenance Control
      </>
    ),
    text: "Monitor maintenance costs, service schedules and equipment performance to reduce unnecessary expenditure."
  }
];
;

const healthcareSection9Slides = [
  {
    title: "Benefits of Healthcare Asset Tracking",
    heading: "Increased Operational Efficiency",
    description:
      "By automating asset management, healthcare professionals can save time and put more focus on patient care instead of managing assets manually.",
  },

  {
    title: "Benefits of Healthcare Asset Tracking",
    heading: "Reduced Equipment Downtime",
    description:
      "Real-time asset tracking helps healthcare facilities identify equipment availability, maintenance needs and potential issues before they affect operations.",
  },

  {
    title: "Benefits of Healthcare Asset Tracking",
    heading: "Better Asset Utilization",
    description:
      "Healthcare organizations can quickly identify where equipment is located, how it is being used and whether additional purchases are actually required.",
  },

  {
    title: "Benefits of Healthcare Asset Tracking",
    heading: "Improved Compliance & Audits",
    description:
      "Maintain accurate asset records, maintenance histories and lifecycle information to support regulatory requirements and audit readiness.",
  },

  {
    title: "Benefits of Healthcare Asset Tracking",
    heading: "Better Patient Care",
    description:
      "When critical medical equipment is easier to locate, maintain and monitor, healthcare teams can spend less time managing assets and more time caring for patients.",
  },
];
const Healthcare = () => {

    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentSlide2, setCurrentSlide2] = useState(0);
    const [healthcareSlideIndex, setHealthcareSlideIndex] = useState(0);
    const [healthcareSection9Slide, setHealthcareSection9Slide] = useState(0);

    // carousel for section 5 
    useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) =>
      (prev + 1) % healthcareSection5Slides.length
    );
  }, 4000);

  return () => clearInterval(interval);
}, []);

const slide = healthcareSection5Slides[currentSlide];

// carousel for section 6 
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide2((prev) =>
      (prev + 1) % healthcareSection6Slides.length
    );
  }, 4000);

  return () => clearInterval(interval);
}, []);

// carousel for section 7
useEffect(() => {
  const interval = setInterval(() => {
    setHealthcareSlideIndex((prev) =>
      (prev + 1) % healthcareSlides.length
    );
  }, 5000);

  return () => clearInterval(interval);
}, []);

// carousel for section 9 

useEffect(() => {
  const interval = setInterval(() => {
    setHealthcareSection9Slide((prev) =>
      (prev + 1) % healthcareSection9Slides.length
    );
  }, 5000);

  return () => clearInterval(interval);
}, [healthcareSection9Slides.length]);
  return (
    <>

    <Helmet>

        {/* =========================
            BASIC SEO
        ========================= */}

        <title>
          Healthcare & Asset Tracking | AssetPegasus
        </title>

        <meta
          name="description"
          content="Manage restaurant and hospitality assets with AssetPegasus. Track kitchen equipment, machinery, maintenance, locations, costs, assignments and complete asset lifecycles from one platform."
        />

        <meta
          name="keywords"
          content="restaurant asset management software, hospitality asset management software, restaurant equipment tracking, kitchen equipment management, restaurant maintenance software, hospitality equipment tracking, restaurant asset tracking, equipment lifecycle management"
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <link
          rel="canonical"
          href="https://assetpegasus.com/healthcare-asset-tracking"
        />


        {/* =========================
            OPEN GRAPH
        ========================= */}

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:title"
          content="Healthcare & Asset Tracking Software | AssetPegasus"
        />

        <meta
          property="og:description"
          content="Track and manage restaurant and hospitality equipment, kitchen assets, maintenance, locations, costs and complete asset lifecycles with AssetPegasus."
        />

        <meta
          property="og:url"
          content="https://assetpegasus.com/healthcare-asset-tracking"
        />

        <meta
          property="og:site_name"
          content="AssetPegasus"
        />

        {/* SHARE IMAGE */}
        <meta
          property="og:image"
          content="https://assetpegasus.com/images/Healthcarepage.webp"
        />

        <meta
          property="og:image:alt"
          content="Restaurant and Hospitality Asset Management Software"
        />

        <meta
          property="og:image:width"
          content="1200"
        />

        <meta
          property="og:image:height"
          content="630"
        />


        {/* =========================
            TWITTER / X
        ========================= */}

        <meta
          name="twitter:card"
          content="summary_large_image"
        />
        <meta
  name="twitter:url"
  content="https://assetpegasus.com/healthcare-asset-tracking"
/>
        <meta
          name="twitter:title"
          content="Healthcare & Asset Tracking Software | AssetPegasus"
        />

        <meta
          name="twitter:description"
          content="Manage restaurant equipment, kitchen assets, maintenance and complete asset lifecycles with AssetPegasus."
        />

        <meta
          name="twitter:image"
          content="https://assetpegasus.com/images/Healthcarepage.webp"
        />

        <meta
          name="twitter:image:alt"
          content="Restaurant and Hospitality Asset Management Software"
        />

      </Helmet>


        <section className="healthcare-hero">

  <div className="healthcare-hero-title">
    <h1>
      Healthcare Asset Tracking Management
    </h1>
  </div>

  {/* layered clip-path */}
  <div className="healthcare-hero-wave healthcare-hero-wave-back"></div>
  <div className="healthcare-hero-wave healthcare-hero-wave-front"></div>

  <div className="healthcare-hero-bottom">

    <div className="healthcare-breadcrumb">
      <Link to="/"   target="_blank"
  rel="noopener noreferrer">Home</Link>
      <span> - Healthcare Asset Tracking</span>
    </div>

    <h2>
      Simple Healthcare Asset Management
      <br />
      that Scales With Your Business.
    </h2>

  </div>

</section>

{/* ================= SECTION 2 ================= */}

<section className="healthcare-section-2">

  <div className="healthcare-section-2-content">

    <p>
      The healthcare industry is a dynamic and time sensitive world and every
      second counts. The hospital or clinic is dealing with thousands of
      critical assets every day, from infusion pumps and ventilators to
      wheelchairs, monitors, laptop computers and diagnostic equipment.
      Equipment may be lost, unused, and go late for maintenance or in short
      supply when needed. Healthcare asset tracking software of today is
      valuable in providing a real time view of equipment, minimizing
      operational delays, enhancing compliance and enabling improved patient
      care.
    </p>

  </div>

  <div className="healthcare-section-2-image">

    <img
      src="/images/Healthcarepage.webp"
      alt="Healthcare asset management dashboard"
    />

  </div>

</section>

{/* ================= SECTION 3 ================= */}

<section className="healthcare-section-3">

  {/* LEFT */}
  <div className="healthcare-section-3-left">

    <h2>Best Features</h2>

    <ul className="healthcare-section-3-features">
      <li>
        ☁️ <strong>Cloud, Hybrid & On Premise</strong> Deployment Options.
      </li>

      <li>
        🛡️ <strong>GDPR & HIPAA</strong> Compliant.
      </li>

      <li>
        💳 <strong>No Credit Card Required.</strong> Start with 7 Days Free Trial.
      </li>

      <li>
        🎯 <strong>Track Every single Asset</strong> Across Its Full Lifecycle.
      </li>

      <li>
        🚨 <strong>Proactive Alerts</strong> for Security Risks, Expirations & Changes.
      </li>

      <li>
        🤖 <strong>Automate License Reporting</strong> and Renewals.
      </li>

      <li>
        ⏱️ <strong>Unlock Modern Inventory</strong> & with Best Visibility.
      </li>
    </ul>

    <Link className="healthcare-section-3-trial" to='/user/signup'   target="_blank"
  rel="noopener noreferrer">
      Start Free Trial
    </Link>

  </div>


  {/* RIGHT */}
  <div className="healthcare-section-3-right">

    <h2>What Is Healthcare Asset Tracking?</h2>

    <Link className="healthcare-section-3-signup" to='/user/signup'   target="_blank"
  rel="noopener noreferrer">
      Sign Up
    </Link>

    <div className="healthcare-section-3-description">

      <p>
        The management of the utilization status, condition,
        maintenance records, and location of healthcare assets
        end-to-end in healthcare facilities is called healthcare asset
        tracking.
      </p>

      <p>
        businesses can tell which assets are supposed to be at what
        location at what time, at every stage – from purchase to
        retirement.
      </p>

    </div>

  </div>

</section>

{/* ================= SECTION 4 ================= */}

<section className="healthcare-section-4">

  <div className="healthcare-section-4-top">

    <h2>
      Free Trial <span>— No Card Required</span>
    </h2>

    <Link className="healthcare-section-4-signin" to="/user/signup"   target="_blank"
  rel="noopener noreferrer">
      Sign In
    </Link>

  </div>


  <div className="healthcare-section-4-bottom">

    <p className="healthcare-section-4-intro">
      Asset management software can aid businesses:
    </p>

    <ul className="healthcare-section-4-list">

      <li>
        <span>🗓️</span>
        Schedule preventive maintenance
      </li>

      <li>
        <span>🖥️</span>
        Monitor equipment condition
      </li>

      <li>
        <span>⚙️</span>
        Automate repair requests
      </li>

      <li>
        <span>🔧</span>
        Reduce unexpected breakdowns
      </li>

    </ul>

    <p className="healthcare-section-4-ending">
      🌐 Reduce downtimes and achieve operational reliability through
      preventive maintenance.
    </p>

  </div>

</section>  

{/* ================= SECTION 5 ================= */}

<section className="healthcare-section-5">

  {/* TOP HEADING */}
  <div className="healthcare-section-5-heading">
    <h2>
      A modern healthcare asset management system enables
      <strong> Hospitals, Clinics,</strong>
      <br />
      <strong>Laboratories and even healthcare networks</strong> to:
    </h2>
  </div>


  {/* MAIN CONTENT */}
  <div className="healthcare-section-5-content">

    {/* LEFT SIDE */}
    <div className="healthcare-section-5-left">

      <h3>
        Key Features of Socialfly for Healthcare Asset Management
      </h3>

      <ul>
        <li>Track medical equipment in real time</li>
        <li>Monitor maintenance and calibration schedules</li>
        <li>Reduce equipment loss and unnecessary purchases</li>
        <li>Improve staff productivity</li>
        <li>Maintain regulatory compliance</li>
        <li>Optimize asset utilization across departments</li>
        <li>Generate audit-ready reports instantly</li>
      </ul>

    </div>


    {/* RIGHT CAROUSEL */}
    <div className="healthcare-section-5-right">

   <div className="healthcare-section-5-slide">

  <h2>{slide.title}</h2>

  <p>{slide.text}</p>

</div>

<div className="healthcare-section-5-dots">
  {healthcareSection5Slides.map((_, index) => (
    <span
      key={index}
      className={index === currentSlide ? "active" : ""}
      onClick={() => setCurrentSlide(index)}
    />
  ))}
</div>


      <Link className="healthcare-section-5-signup" to="/user/signup"   target="_blank"
  rel="noopener noreferrer">
        Sign Up Now
      </Link>

    </div>

  </div>

</section>


{/* ================= SECTION 6 ================= */}

<section className="healthcare-section-6">

  <div className="healthcare-section-6-content">

    <h2>
      Why Healthcare Facilities Need Asset Tracking Software
    </h2>

    <p className="healthcare-section-6-subtitle">
      This minimizes downtime and boosts asset life.
    </p>

    {/* CAROUSEL CONTENT */}
<div className="healthcare-section-6-slide">

  <h3>
    <span className="healthcare-section-6-icon">
      {healthcareSection6Slides[currentSlide2].icon}
    </span>

    {healthcareSection6Slides[currentSlide2].title}
  </h3>

  <p>
    {healthcareSection6Slides[currentSlide2].text}
  </p>

</div>

    {/* DOTS */}
<div className="healthcare-section-6-dots">

  {healthcareSection6Slides.map((_, index) => (
    <span
      key={index}
      className={index === currentSlide ? "active" : ""}
      onClick={() => setCurrentSlide(index)}
    />
  ))}

</div>
    <Link className="healthcare-section-6-signin" to="/user/signup"   target="_blank"
  rel="noopener noreferrer">
      Sign Up Now
    </Link>

  </div>

  {/* BOTTOM CLIP */}
  <div className="healthcare-section-6-clip"></div>

</section>

<section className="healthcare-section-7">

  {/* LEFT */}
  <div className="healthcare-section-7-left">
    <p>The Healthcare industry is rapidly adopting:</p>

    <ul>
      <li>Cloud based management systems</li>
      <li>Smart maintenance automation</li>
      <li>Mobile friendly operations</li>
      <li>Real time operational dashboards</li>
    </ul>
  </div>


  {/* RIGHT CAROUSEL */}
  <div className="healthcare-section-7-right">

    <div className="healthcare-section-7-image-wrapper">
      <img
        src={healthcareSlides[healthcareSlideIndex].image}
        alt={healthcareSlides[healthcareSlideIndex].alt}
      />
    </div>

    <div className="healthcare-section-7-dots">
      {healthcareSlides.map((_, index) => (
        <span
          key={index}
          className={
            healthcareSlideIndex === index
              ? "healthcare-dot active"
              : "healthcare-dot"
          }
          onClick={() => setHealthcareSlideIndex(index)}
        />
      ))}
    </div>

  </div>

</section>

<section className="healthcare-section-8">

  <div className="healthcare-stat">
    <h2>500+</h2>
    <p>
      Companies Trust Our<br />
      Solution
    </p>
  </div>

  <div className="healthcare-stat">
    <h2>95%</h2>
    <p>Uptime Guarantee</p>
  </div>

  <div className="healthcare-stat">
    <h2>100%</h2>
    <p>Automated Workflow</p>
  </div>

  <div className="healthcare-stat">
    <h2>100%</h2>
    <p>
      GDPR &amp; HIPAA<br />
      Compliant
    </p>
  </div>

</section>

<section className="healthcare-section-9">

  <div className="healthcare-section-9-left">

    <p className="healthcare-section-9-intro">
      A Healthcare asset tracking system can control a huge array of
      medical and operational assets, such as:
    </p>

    <ul className="healthcare-section-9-assets">
      <li>Ventilators</li>
      <li>Infusion pumps</li>
      <li>Patient monitors</li>
      <li>Defibrillators</li>
      <li>Wheelchairs</li>
      <li>Hospital beds</li>
      <li>Diagnostic equipment</li>
      <li>Surgical instruments</li>
      <li>Portable ultrasound machines</li>
      <li>Laboratory devices</li>
      <li>IT hardware and tablets</li>
      <li>Workstations on wheels</li>
      <li>Biomedical equipment</li>
      <li>PPE inventory</li>
      <li>Facility maintenance equipment</li>
    </ul>

    <p className="healthcare-section-9-ending">
      But a single view of all assets is necessary for a
      modern healthcare organization to streamline
      operations and lower business risk.
    </p>

  </div>


  {/* RIGHT SIDE CAROUSEL */}
<div className="healthcare-section-9-right">

  <div className="healthcare-section-9-slide">

    <h3>
      {healthcareSection9Slides[healthcareSection9Slide].title}
    </h3>

    <Link className="healthcare-section-9-button" to="/user/signup"   target="_blank"
  rel="noopener noreferrer">
      Sign Up Now
    </Link>

    <h2>
      {healthcareSection9Slides[healthcareSection9Slide].heading}
    </h2>

    <p>
      {healthcareSection9Slides[healthcareSection9Slide].description}
    </p>

  </div>


  {/* DOTS */}
  <div className="healthcare-section-9-dots">

    {healthcareSection9Slides.map((_, index) => (
      <span
        key={index}
        className={
          index === healthcareSection9Slide
            ? "active"
            : ""
        }
        onClick={() => setHealthcareSection9Slide(index)}
      />
    ))}

  </div>

</div>

</section>


<section className="healthcare-section-10">

  <h2>Healthcare Asset Tracking with Socialfly</h2>

  <p className="healthcare-section-10-intro">
    Socialfly is a contemporary asset management platform created to make it simpler
    to track, oversee, and observe healthcare gear all the way through its lifecycle —
    particularly for rising organizations. The platform enables healthcare providers to:
  </p>

  <p className="healthcare-section-10-subtitle">
    With Socialfly’s platform, businesses can:
  </p>

  <div className="healthcare-section-10-checklist">

    <div className="healthcare-check healthcare-check-1">
      <span className="check-icon">✓</span>
      <span>Track medical assets across departments and facilities</span>
    </div>

    <div className="healthcare-check healthcare-check-2">
      <span className="check-icon">✓</span>
      <span>Monitor maintenance, warranty, and insurance details</span>
    </div>

    <div className="healthcare-check healthcare-check-3">
      <span className="check-icon">✓</span>
      <span>Maintain HIPAA and GDPR compliance</span>
    </div>

    <div className="healthcare-check healthcare-check-4">
      <span className="check-icon">✓</span>
      <span>Generate instant reports and analytics</span>
    </div>

    <div className="healthcare-check healthcare-check-5">
      <span className="check-icon">✓</span>
      <span>Improve equipment utilization</span>
    </div>

    <div className="healthcare-check healthcare-check-6">
      <span className="check-icon">✓</span>
      <span>Automate alerts for renewals, servicing, and compliance</span>
    </div>

    <div className="healthcare-check healthcare-check-7">
      <span className="check-icon">✓</span>
      <span>Centralize asset records in one dashboard</span>
    </div>

  </div>

  <p className="healthcare-section-10-ending">
    Socialfly Asset Management System (SAMS) enables companies to reduce costs,
    increase visibility and manage the entire asset lifecycle, either hardware,
    software or cloud.
  </p>

  <Link className="healthcare-section-10-button" to="/user/signup"   target="_blank"
  rel="noopener noreferrer">
    Sign Up Now
  </Link>

</section>

<section className="healthcare-section-11">

  <div className="healthcare-section-11-content">

    <h2>
      The Future of Healthcare Asset Management
    </h2>

    <p>
      AI-based analytics, powered tracking, predictive maintenance, and
      cloud based architecture are revolutionizing asset management in
      healthcare.
    </p>

    <p>
      Predictive maintenance and cloud-based infrastructure are changing
      the landscape of asset management in healthcare. Real time
      healthcare asset tracking is no longer a choice, it’s a necessity
      for maximizing operational efficiencies, ensuring compliance,
      controlling costs and improving patient care.
    </p>

    <p>
      The ongoing digitalisation of healthcare operations and processes
      will continue to rely on healthcare asset tracking software to
      enhance workflow efficiency, minimise downtime, and make sure that
      all critical assets are in place when required.
    </p>

    <p>
      In the ever evolving landscape of healthcare, asset tracking
      solutions offer a scalable and forward-looking solution for
      modernizing healthcare operations, bolstering compliance, and
      maximizing the use of medical equipment.
    </p>

  </div>

</section>

<section className="healthcare-section-12">
  <div className="healthcare-section-12-content">

    <h2>Why Businesses Choose Socialfly</h2>

    <h3>8+ Years of Building Digital Success Stories.</h3>

    <p>
      Small, Medium &amp; Big Organizations require a simple flexible and
      scalable asset management platform which capable of managing
      <br />
      complex asset environments.
    </p>

    <p>
      <Link href="/ham-itam">HAM &amp; ITAM</Link> we bring all that expertise into
      a single SaaS (Software as Service) platform that helps to Manage
      Businesses &amp;
      <br />
      Individuals.
    </p>

    <Link
      className="healthcare-section-12-btn"
      to = "/about-us"
        target="_blank"
  rel="noopener noreferrer"
    >
      About Us
    </Link>

  </div>
</section>

<ProductFeatures />

<section className="hospitality-section-14">

  <div className="hospitality-industry-cards">

    {/* CARD 1 */}
    <Link to="/travel-transportation-asset-management" 
      target="_blank"
  rel="noopener noreferrer"className="hospitality-industry-card">
      <div className="hospitality-industry-icon">
        ✈
      </div>

      <h3>
        Travel &amp;
        <br />
        Transportation
        <br />
        Logistics
      </h3>
    </Link>


    {/* CARD 2 */}
    <Link to="/restaurant-hospitality-asset-management" 
      target="_blank"
  rel="noopener noreferrer"className="hospitality-industry-card industry-card-raised">
      <div className="hospitality-industry-icon">
        <FaHospital />
      </div>

      <h3>
        Restaurant
        <br />
        Asset
        <br />
        Tracking
      </h3>
    </Link>


    {/* CARD 3 */}
    <Link to="/education-asset-management" 
      target="_blank"
  rel="noopener noreferrer"className="hospitality-industry-card">
      <div className="hospitality-industry-icon">
        <FaBook />
      </div>

      <h3>
        Education
        <br />
        Asset
        <br />
        Management
      </h3>
    </Link>


    {/* CARD 4 */}
    <Link to="/construction-equipment-tracking" 
      target="_blank"
  rel="noopener noreferrer"
  className="hospitality-industry-card industry-card-raised">
      <div className="hospitality-industry-icon">
        <FaToolbox/>
      </div>

      <h3>
        Construction
        <br />
        Equipment
        <br />
        Tracking
      </h3>
    </Link>


    {/* CARD 5 */}
    <Link to="/manufacturing-asset-management-software"
      target="_blank"
  rel="noopener noreferrer"
   className="hospitality-industry-card">
      <div className="hospitality-industry-icon">
        ⚙
      </div>

      <h3>
        Manufacturing
        <br />
        Asset
        <br />
        Management
      </h3>
    </Link>

  </div>

</section>

<section className="healthcare-section-13">

  <div className="healthcare-section-13-top">

    <h2>Asset Management System</h2>

    <Link
      className="healthcare-section-13-signup" to="/user/signup"
        target="_blank"
  rel="noopener noreferrer"
    >
      Sign Up Now
      <span>→</span>
    </Link>

  </div>

  {/* <div className="healthcare-section-13-visit">

    <h3>Visit</h3>

    <div className="healthcare-section-13-links">

      <button
        onClick={() =>
          window.location.href = "/equipment-asset-management"
        }
      >
        Equipment Asset Management System
      </button>

      <button
        onClick={() =>
          window.location.href = "/it-asset-management"
        }
      >
        IT Asset Management System
      </button>

    </div>

  </div> */}

</section>

<section className="healthcare-section-14">

  <h2 className="healthcare-section-14-title">
    FAQ (Frequently Asked Questions)
  </h2>

  <div className="healthcare-faq">

    {/* FAQ 1 */}
    <details className="healthcare-faq-item">
      <summary>
        What is Healthcare Asset Tracking software?
      </summary>

      <div className="healthcare-faq-answer">
        Healthcare Asset Tracking software is a centralized system that
        helps hospitals, clinics, laboratories and healthcare organizations
        track, monitor and manage their medical and operational assets
        throughout their complete lifecycle.
      </div>
    </details>

    {/* FAQ 2 */}
    <details className="healthcare-faq-item">
      <summary>
        Why do Healthcare need asset tracking software?
      </summary>

      <div className="healthcare-faq-answer">
        Healthcare organizations manage thousands of critical assets such
        as ventilators, infusion pumps, patient monitors, wheelchairs and
        diagnostic equipment. Asset tracking software provides real-time
        visibility into asset location, condition, maintenance and usage,
        helping reduce downtime, losses and unnecessary purchases.
      </div>
    </details>

    {/* FAQ 3 */}
    <details className="healthcare-faq-item">
      <summary>
        How does asset lifecycle management help Healthcare business?
      </summary>

      <div className="healthcare-faq-answer">
        Asset lifecycle management helps healthcare businesses monitor
        assets from purchase and deployment through maintenance, warranty,
        insurance, upgrades and retirement. This improves asset utilization,
        reduces unexpected costs and helps organizations make better
        replacement and purchasing decisions.
      </div>
    </details>

    {/* FAQ 4 */}
    <details className="healthcare-faq-item">
      <summary>
        Can asset management software track Healthcare equipment?
      </summary>

      <div className="healthcare-faq-answer">
        Yes. Healthcare asset management software can track equipment such
        as ventilators, infusion pumps, patient monitors, defibrillators,
        wheelchairs, hospital beds, diagnostic equipment, surgical
        instruments, laboratory devices and other operational assets.
      </div>
    </details>

    {/* FAQ 5 */}
    <details className="healthcare-faq-item">
      <summary>
        Is asset management software useful for multiple Healthcare Asset locations?
      </summary>

      <div className="healthcare-faq-answer">
        Yes. A centralized asset management system can provide visibility
        across multiple hospitals, clinics, laboratories, departments and
        storage locations. Organizations can monitor where assets are
        located, who is using them and their current status from one
        centralized platform.
      </div>
    </details>

  </div>

</section>
    </>
  )
}

export default Healthcare