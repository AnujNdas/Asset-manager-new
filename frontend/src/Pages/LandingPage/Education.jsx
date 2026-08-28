import React from 'react'
import "../../Page_styles/LandingPage/Education.css"
import { useState, useEffect } from 'react';
import { FaBuilding, FaChrome, FaBook ,  FaHospital, FaToolbox } from "react-icons/fa";
import { Link } from 'react-router-dom';
import ProductFeatures from '../../Components/Mainpage/ProductFeature';
import { Helmet } from 'react-helmet-async';
const educationSection11Slides = [
  {
    leftTitle: "Best Education Asset Management Software",
    leftSubtitle: "Complete lifecycle",
    leftContent: [
      "Stage 1: Purchase",
      "Stage 2: Deployment & Configuration",
      "Stage 3: Active Use & Monitoring",
      "Stage 4: Maintenance & Support",
      "Stage 5: Optimization & License Management",
    ],

    rightTitle: "Types of Educational Assets That Can Be Managed",
    assets: [
      "Laptops and Chromebooks",
      "Tablets and mobile devices",
      "Smart classroom equipment",
      "Projectors and AV systems",
      "Laboratory instruments",
      "Library inventory",
      "Furniture and fixtures",
    ],
  },

  {
    leftTitle: "Education Asset Lifecycle Management",
    leftSubtitle: "Manage assets from acquisition to retirement",
    leftContent: [
      "Asset Acquisition & Registration",
      "Department & User Assignment",
      "Location & Inventory Tracking",
      "Maintenance & Warranty Management",
      "Transfers & Reallocation",
      "Retirement & Disposal",
    ],

    rightTitle: "More Educational Assets You Can Track",
    assets: [
      "Desktop Computers",
      "Interactive Whiteboards",
      "Printers & Scanners",
      "Networking Equipment",
      "Servers & Data Storage",
      "Sports Equipment",
      "Campus Infrastructure",
    ],
  },
];
const section9Slides = [
  {
    icon: "✅",
    title: "Easiest User experience",
    text: "Capture all types of assets details with easiest way.",
    image: "/images/info.webp",
  },
  {
    icon: "🛡️",
    title: "Security & Risk Management",
    text: "Identify outdated software or unauthorized devices to fortify your organization’s security posture.",
    image: "/images/construction.webp",
  },
  {
    icon: "📊",
    title: "Drive Operational Efficiency",
    text: "Eliminate manual tracking and human errors & Improve asset allocation and internal workflows.",
    image: "/images/healthcare.webp",
  },
];

const educationSection8Slides = [
  {
    title: "Audit & Compliance Reporting",
    description:
      "Create precise audit reports in a split second to review internally, meet funding criteria and asset accountability.",
  },
  {
    title: "Improved Asset Visibility",
    description:
      "Get a complete view of computers, laboratory equipment, classroom technology, furniture and other institutional assets from one centralized system.",
  },
  {
    title: "Better Equipment Utilization",
    description:
      "Track asset usage across departments and identify underutilized equipment so educational institutions can make better purchasing decisions.",
  },
  {
    title: "Preventive Maintenance",
    description:
      "Schedule maintenance activities and receive timely alerts to reduce equipment downtime and extend the useful life of institutional assets.",
  },
  {
    title: "Centralized Asset Records",
    description:
      "Maintain accurate records of asset locations, assignments, warranties, maintenance history and ownership across the entire institution.",
  },
  {
    title: "Asset Allocation & Transfers",
    description:
      "Easily manage the movement and allocation of equipment between classrooms, departments, laboratories and other facilities.",
  },
  {
    title: "Warranty & Depreciation Tracking",
    description:
      "Monitor warranty periods and depreciation information to improve financial planning and prevent unexpected replacement costs.",
  },
  {
    title: "Smarter Budget Planning",
    description:
      "Use asset data and historical records to make informed decisions about purchases, replacements, upgrades and future institutional investments.",
  },
  {
    title: "Complete Asset Lifecycle Management",
    description:
      "Track every asset from acquisition and deployment through maintenance, upgrades, transfers and eventual retirement.",
  },
];

const educationCarouselData = [
  {
    title: "Smarter Decision Making",
    description:
      "Real time analytics and reporting give insights on assets, asset usage, maintenance expenses, and purchase planning.",
  },
  {
    title: "Better Asset Utilization",
    description:
      "Track classrooms, computers, laboratory equipment, furniture, and other resources to ensure maximum utilization.",
  },
  {
    title: "Reduced Equipment Downtime",
    description:
      "Schedule preventive maintenance and receive timely alerts to reduce equipment failures and unexpected downtime.",
  },
  {
    title: "Improved Compliance",
    description:
      "Maintain accurate asset records and generate reports that support institutional policies, audits, and compliance requirements.",
  },
  {
    title: "Centralized Asset Visibility",
    description:
      "Manage educational assets across schools, campuses, departments, laboratories, libraries, and administrative facilities from one system.",
  },
];



const educationSection7Slides = [
  {
    title: "Enhanced Accountability",
    description:
      "Monitoring device/equipment usage can increase transparency and accountability of device or equipment usage among staff, students and departments.",
  },
  {
    title: "Improved Asset Utilization",
    description:
      "Track how educational assets are being used across classrooms, laboratories and departments to maximize utilization and reduce unnecessary purchases.",
  },
  {
    title: "Reduced Equipment Downtime",
    description:
      "Automated maintenance schedules and alerts help educational institutions identify maintenance requirements before equipment failures occur.",
  },
  {
    title: "Better Asset Visibility",
    description:
      "Maintain a centralized view of computers, laboratory equipment, classroom technology, furniture and other institutional assets.",
  },
  {
    title: "Simplified Maintenance",
    description:
      "Keep maintenance schedules, service records, warranties and asset history organized in one centralized asset management system.",
  },
  {
    title: "Smarter Budget Planning",
    description:
      "Use asset data, maintenance costs and lifecycle information to make better purchasing and replacement decisions.",
  },
  {
    title: "Improved Operational Efficiency",
    description:
      "Automate asset tracking and administrative processes so staff can spend less time managing assets manually.",
  },
];
const Education = () => {
    const [currentSlide2, setCurrentSlide2] = useState(0);
      const [currentSlide, setCurrentSlide] = useState(0);
    const [activeSlide, setActiveSlide] = useState(0);
    const [activeSlide2, setActiveSlide2] = useState(0);
    const [activeSlide3, setActiveSlide3] = useState(0);


    //   carousel for section 4 

      useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === educationCarouselData.length - 1
          ? 0
          : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

//   carousel section 7 
    useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide2((prev) =>
        prev === educationSection7Slides.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

//   section 8 carousel 

useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) =>
        prev === educationSection8Slides.length - 1
          ? 0
          : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

//   section 9 carousel 
 useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide2((prev) => (prev + 1) % section9Slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

//   carousel for section 11 

useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide3((prev) =>
        prev === educationSection11Slides.length - 1
          ? 0
          : prev + 1
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const slide = educationSection11Slides[activeSlide3];
  return (
    <>

<Helmet>

        {/* =========================
            BASIC SEO
        ========================= */}

        <title>
          Education & Asset Management Software | AssetPegasus
        </title>

        <meta
          name="description"
          content="Manage and track transportation assets, vehicles, equipment, maintenance, locations, costs, assignments and complete asset lifecycles with AssetPegasus."
        />

        <meta
          name="keywords"
          content="transportation asset management software, travel asset management software, transportation equipment tracking, fleet asset management, vehicle asset tracking, transportation asset tracking software, travel equipment management, transportation asset lifecycle management"
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <link
          rel="canonical"
          href="https://assetpegasus.com/education-asset-management"
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
          content="Education & Asset Management Software | AssetPegasus"
        />

        <meta
          property="og:description"
          content="Track and manage transportation assets, vehicles, equipment, maintenance, locations, costs and complete asset lifecycles with AssetPegasus."
        />

        <meta
          property="og:url"
          content="https://assetpegasus.com/education-asset-management"
        />

        <meta
          property="og:site_name"
          content="AssetPegasus"
        />

        <meta
          property="og:image"
          content="https://assetpegasus.com/images/Educationpage.webp"
        />

        <meta
          property="og:image:alt"
          content="Education and Asset Management Software"
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
          name="twitter:title"
          content="Education & Asset Management Software | AssetPegasus"
        />

        <meta
          name="twitter:description"
          content="Manage and track transportation assets, vehicles, equipment, maintenance, locations, costs and complete asset lifecycles with AssetPegasus."
        />

        <meta
          name="twitter:url"
          content="https://assetpegasus.com/education-asset-management"
        />

        <meta
          name="twitter:image"
          content="https://assetpegasus.com/images/Educationpage.webp"
        />

        <meta
          name="twitter:image:alt"
          content="Education and Asset Management Software"
        />

      </Helmet>

    {/* ================= SECTION 1 ================= */}

<section className="education-section1">

  <div className="education-section1-hero">

    <h1>
      Education Asset Management Software
    </h1>

  </div>

  <div className="education-section1-bottom">

    <div className="education-breadcrumb">
      <Link to="/" 
        target="_blank"
  rel="noopener noreferrer">Home</Link>
      <span> - </span>
      <span>Education Asset Management</span>
    </div>

  </div>

</section>

{/* ================= SECTION 2 ================= */}

<section className="education-section2">

  <h2>
    Simple Education Asset Management Software
    <br />
    that Scales With Your Business.
  </h2>

  <p>
    Today’s education management handle so much more than a class and books.
    These are common components in schools, colleges, universities, and
    training centres that can be daily affected by their day-to-day
    operations including laptop computers, Tablets, lab equipment,
    projectors, smart boards, library inventory, furniture, sporting goods,
    servers, and also facility infrastructure. Tracking and management of
    these assets is time consuming, inefficient and costly without a central
    system.
  </p>

</section>

{/* ================= SECTION 3 ================= */}

<section className="education-section3">

  <div className="education-dashboard-wrapper">
    <img
      src="/images/Educationpage.webp"
      alt="Education Asset Management Dashboard"
      className="education-dashboard-image"
    />
  </div>

</section>
    <section className="education-section4">

      {/* ================= LEFT SIDE ================= */}

      <div className="education-section4-left">

        <h2>Best Features</h2>

        <ul className="education-best-features">

          <li>
            <span>☁️</span>
            Cloud, Hybrid &amp; On Premise Deployment Options.
          </li>

          <li>
            <span>🛡️</span>
            GDPR &amp; HIPAA Compliant.
          </li>

          <li>
            <span>💳</span>
            No Credit Card Required. Start with 7 Days Free Trial.
          </li>

          <li>
            <span>🎯</span>
            Track Every single Asset Across Its Full Lifecycle.
          </li>

          <li>
            <span>🚨</span>
            Proactive Alerts for Security Risks, Expirations &amp; Changes.
          </li>

          <li>
            <span>🤖</span>
            Automate License Reporting and Renewals.
          </li>

          <li>
            <span>⏱️</span>
            Unlock Modern Inventory &amp; with Best Visibility.
          </li>

        </ul>

        <Link to="/user/signup"
          target="_blank"
  rel="noopener noreferrer"
        className="education-free-trial-btn">
          Free Trial – No Card Required
        </Link>

      </div>


      {/* ================= RIGHT SIDE ================= */}

      <div className="education-section4-right">

        <h2>
          Benefits of Education Asset
          <br />
          Management
        </h2>

        <Link to="/user/signup"
          target="_blank"
  rel="noopener noreferrer"
   className="education-signup-btn">
          Sign Up
        </Link>

        <div className="education-carousel-content">

          <h3>
            {educationCarouselData[currentSlide].title}
          </h3>

          <p>
            {educationCarouselData[currentSlide].description}
          </p>

        </div>


        {/* ================= DOTS ================= */}

        <div className="education-carousel-dots">

          {educationCarouselData.map((_, index) => (
            <button
              key={index}
              className={`education-carousel-dot ${
                currentSlide === index ? "active" : ""
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}

        </div>

      </div>

    </section>

    <section className="education-section5">

      <h2>What Is Education Asset Management?</h2>

      <p className="education-section5-intro">
        Education asset management is the procedure to track, monitor,
        maintain and optimize physical and electronic property utilized in
        educational organizations. It encompasses the overall asset life
        cycle, ranging from acquisition to deployment, to maintenance,
        upgrade, and retirement.
      </p>

      <div className="education-section5-content">

        <p>
          An education asset management system makes it possible for you to
          have an education-wide view into:
        </p>

        <p>
          When you have a good solution in place like industrial asset
          management software, you can come up with a single asset management
          database for all the factory assets. This allows for the coordination
          of equipment among multiple plants, to create operational reports,
          and to enhance long term planning.
        </p>

      </div>

    </section>

    <section className="education-section6">

      <p className="education-section6-intro">
        An education asset management system makes it possible for you to
        have an education-wide view into:
      </p>

      <div className="education-section6-list">

        <div className="education-check-item item-1">
          <span className="education-check">✓</span>
          <span>IT equipment and devices</span>
        </div>

        <div className="education-check-item item-2">
          <span className="education-check">✓</span>
          <span>Classroom technology</span>
        </div>

        <div className="education-check-item item-3">
          <span className="education-check">✓</span>
          <span>Laboratory assets</span>
        </div>

        <div className="education-check-item item-4">
          <span className="education-check">✓</span>
          <span>Furniture and infrastructure</span>
        </div>

        <div className="education-check-item item-5">
          <span className="education-check">✓</span>
          <span>Library resources</span>
        </div>

        <div className="education-check-item item-6">
          <span className="education-check">✓</span>
          <span>Maintenance schedules</span>
        </div>

        <div className="education-check-item item-7 no-check">
          <span>Asset allocation and transfers</span>
        </div>

        <div className="education-check-item item-8">
          <span className="education-check">✓</span>
          <span>Warranty and depreciation tracking</span>
        </div>

      </div>

    </section>


    <section className="education-section7">

      {/* SECTION TITLE */}
      <h2 className="education-section7-title">
        Why Educational Institutions Need Asset Management Software
      </h2>

      <div className="education-section7-content">

        {/* LEFT STATIC CONTENT */}
        <div className="education-section7-left">

          <h3>
            Key Features of AssetPegasus for Education Asset Management
          </h3>

          <ul>
            <li>
              <strong>Real Time Asset Tracking</strong>
              <span>
                Track the condition, location and status of equipment real
                time.
              </span>
            </li>

            <li>
              <strong>QR Code Tracking</strong>
              <span>
                Instantly scan assets while using mobile devices to update
                asset data.
              </span>
            </li>

            <li>
              <strong>Preventive Maintenance Scheduling</strong>
              <span>
                Programmed alerts for maintenance to minimise equipment
                downtime.
              </span>
            </li>
          </ul>

        </div>

        {/* RIGHT CAROUSEL */}
        <div className="education-section7-right">

          <div className="education-section7-carousel">

            <h3>
              {educationSection7Slides[currentSlide2].title}
            </h3>

            <p>
              {educationSection7Slides[currentSlide2].description}
            </p>

          </div>

          {/* DOTS */}
          <div className="education-section7-dots">
            {educationSection7Slides.map((_, index) => (
              <button
                key={index}
                className={
                  index === currentSlide2
                    ? "education-section7-dot active"
                    : "education-section7-dot"
                }
                onClick={() => setCurrentSlide2(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* BUTTON */}
          <Link
            className="education-section7-signup"
            to="/user/signup"
              target="_blank"
  rel="noopener noreferrer"
          >
            Sign Up Now
          </Link>

        </div>

      </div>
    </section>

     <section className="education-section8">

      <div className="education-section8-content">

        <h2>
          Key Features of Education Asset Management Software
        </h2>

        <div className="education-section8-carousel">

          <h3>
            {educationSection8Slides[activeSlide].title}
          </h3>

          <p>
            {educationSection8Slides[activeSlide].description}
          </p>

        </div>

        <div className="education-section8-dots">
          {educationSection8Slides.map((_, index) => (
            <button
              key={index}
              className={
                index === activeSlide
                  ? "education-section8-dot active"
                  : "education-section8-dot"
              }
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <Link
          className="education-section8-signin"
          to="/user/signup"
            target="_blank"
  rel="noopener noreferrer"
        >
          Sign Up
        </Link>

      </div>

      {/* Bottom clip-path decoration */}
      <div className="education-section8-wave" />

    </section>

    <section className="education-section9">

      <div className="education-section9-container">

        {/* LEFT SIDE */}
        <div className="education-section9-left">

          {section9Slides.map((slide, index) => (
            <div
              key={index}
              className={`education-section9-feature ${
                activeSlide2 === index ? "active" : ""
              }`}
            >
              <div className="education-section9-icon">
                {slide.icon}
              </div>

              <h3>{slide.title}</h3>

              <p>{slide.text}</p>
            </div>
          ))}

        </div>

        {/* RIGHT SIDE */}
        <div className="education-section9-right">

          <div className="education-section9-image-wrapper">

            <img
              key={section9Slides[activeSlide2].image}
              src={section9Slides[activeSlide2].image}
              alt={section9Slides[activeSlide2].title}
              className="education-section9-image"
            />

          </div>

        </div>

      </div>

      {/* CAROUSEL DOTS */}
      <div className="education-section9-dots">

        {section9Slides.map((_, index) => (
          <button
            key={index}
            className={`education-section9-dot ${
              activeSlide2 === index ? "active" : ""
            }`}
            onClick={() => setActiveSlide2(index)}
            aria-label={`Go to slide ${index + 1}`}
          />

        ))}

      </div>

    </section>

    {/* ================= SECTION 10 ================= */}
<section className="education-section10">

  <div className="education-stats-container">

    <div className="education-stat">
      <h2>500+</h2>
      <p>Companies Trust Our<br />Solution</p>
    </div>

    <div className="education-stat">
      <h2>95%</h2>
      <p>Uptime Guarantee</p>
    </div>

    <div className="education-stat">
      <h2>100%</h2>
      <p>Automated Workflow</p>
    </div>

    <div className="education-stat">
      <h2>100%</h2>
      <p>GDPR &amp; HIPAA<br />Compliant</p>
    </div>

  </div>

</section>

 <section className="education-section11">

      <div className="education-section11-container">

        {/* LEFT */}
        <div className="education-section11-left">

          <h2>{slide.leftTitle}</h2>

          <p className="education-section11-subtitle">
            {slide.leftSubtitle}
          </p>

          <div className="education-section11-lifecycle">
            {slide.leftContent.map((item, index) => (
              <p key={index}>
                {item}
              </p>
            ))}
          </div>

        </div>

        {/* RIGHT */}
        <div className="education-section11-right">

          <h3>{slide.rightTitle}</h3>

          <Link
            className="education-section11-trial"
            to="/user/signup"
              target="_blank"
  rel="noopener noreferrer"
          >
            Free Trial
          </Link>

          <div className="education-section11-assets">
            {slide.assets.map((asset, index) => (
              <div
                className="education-section11-asset"
                key={index}
              >
                <span className="education-section11-check">
                  ✓
                </span>

                <span>{asset}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* DOTS */}
      <div className="education-section11-dots">

        {educationSection11Slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveSlide3(index)}
            className={
              index === activeSlide3
                ? "education-section11-dot active"
                : "education-section11-dot"
            }
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}

      </div>

    </section>

    {/* ================= SECTION 12 ================= */}

<section className="education-section12">

  <div className="education-section12-container">

    <h2>
      Education Asset Management with AssetPegasus
    </h2>

    <p className="education-section12-intro">
      AssetPegasus offers a compelling and efficient, centralised asset
      management system for educational service providers that makes it easy
      to keep track of the entire lifecycle of assets in the service, increase
      transparency within the organisation and operate easily.
    </p>

    <p className="education-section12-subtitle">
      The quality of life of schools, colleges and universities with
      Socialfly’s asset management solution is bolstered by the ability to:
    </p>

    <div className="education-section12-list">

      <div className="education-section12-item item-1">
        <span className="education-check">✓</span>
        <span>
          Monitor assets from classrooms through labs to libraries and campuses.
        </span>
      </div>

      <div className="education-section12-item item-2">
        <span className="education-check">✓</span>
        <span>
          Keep an eye on maintenance schedules and warranty information
        </span>
      </div>

      <div className="education-section12-item item-3">
        <span className="education-check">✓</span>
        <span>
          Minimize loss of equipment and manual error
        </span>
      </div>

      <div className="education-section12-item item-4">
        <span className="education-check">✓</span>
        <span>
          Track reports and ensure you are audit compliant at a moment’s notice.
        </span>
      </div>

      <div className="education-section12-item item-5">
        <span className="education-check">✓</span>
        <span>
          Enhance accountability and transparency
        </span>
      </div>

      <div className="education-section12-item item-6">
        <span className="education-check">✓</span>
        <span>
          Smooth out Inventory Operations.
        </span>
      </div>

      <div className="education-section12-item item-7">
        <span className="education-check">✓</span>
        <span>
          Available on a single dashboard, all asset information is centralized.
        </span>
      </div>

    </div>

    <Link
      className="education-section12-button"
      to="/user/signup"
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
  rel="noopener noreferrer"
  className="hospitality-industry-card">
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
    <Link to="/healthcare-asset-tracking"
    target="_blank"
  rel="noopener noreferrer" 
    className="hospitality-industry-card industry-card-raised">
      <div className="hospitality-industry-icon">
        <FaHospital />
      </div>

      <h3>
        Healthcare
        <br />
        Asset
        <br />
        Tracking
      </h3>
    </Link>


    {/* CARD 3 */}
    <Link to="/construction-equipment-tracking"
      target="_blank"
  rel="noopener noreferrer"
  className="hospitality-industry-card">
      <div className="hospitality-industry-icon">
        <FaToolbox />
      </div>

      <h3>
        Construction
        <br />
        Asset
        <br />
        Management
      </h3>
    </Link>


    {/* CARD 4 */}
    <Link to="/restaurant-hospitality-asset-management" 
    target="_blank"
  rel="noopener noreferrer"
  className="hospitality-industry-card industry-card-raised">
      <div className="hospitality-industry-icon">
        <FaBuilding />
      </div>

      <h3>
        Restaurant
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

{/* ================= SECTION 13 ================= */}

<section className="education-section13">

  <div className="education-section13-top">

    <h2>
      Asset Management System
    </h2>

    <Link
      className="education-section13-signup"
      to="/user/signup"
        target="_blank"
  rel="noopener noreferrer"
    >
      <span>Sign Up Now</span>
      <span className="education-section13-arrow">→</span>
    </Link>

  </div>

{/* 
  <div className="education-section13-content">

    <h3>Visit</h3>

    <div className="education-section13-links">

      <button
        onClick={() => {
          window.location.href = "/equipment-management";
        }}
      >
        Equipment Asset Management System
      </button>

      <button
        onClick={() => {
          window.location.href = "/itam-management";
        }}
      >
        IT Asset Management System
      </button>

    </div>

  </div> */}

</section>

{/* ================= SECTION 14 - FAQ ================= */}

<section className="education-section14">

  <div className="education-section14-container">

    <h2>FAQ (Frequently Asked Questions)</h2>

    <div className="education-faq">

      {/* FAQ 1 */}
      <details>
        <summary>
          What is Education Asset Management software ?
        </summary>

        <div className="education-faq-answer">
          Education Asset Management software is a centralized system that
          helps schools, colleges, universities, and educational institutions
          track, manage, maintain, and monitor their physical and digital
          assets throughout their complete lifecycle.
        </div>
      </details>


      {/* FAQ 2 */}
      <details>
        <summary>
          Why do Institutes, University, Schools need asset tracking software ?
        </summary>

        <div className="education-faq-answer">
          Schools, universities, and educational institutes manage a large
          number of assets such as laptops, tablets, projectors, laboratory
          equipment, furniture, library resources, servers, and other
          infrastructure. Asset tracking software provides centralized
          visibility, reduces asset loss, improves accountability, and makes
          maintenance and asset allocation easier.
        </div>
      </details>


      {/* FAQ 3 */}
      <details>
        <summary>
          How does asset lifecycle management help University & Institutes ?
        </summary>

        <div className="education-faq-answer">
          Asset lifecycle management allows educational institutions to track
          assets from purchase and deployment through assignment, maintenance,
          upgrades, transfers, and retirement. This helps institutions reduce
          downtime, control costs, improve utilization, and maintain accurate
          asset records.
        </div>
      </details>


      {/* FAQ 4 */}
      <details>
        <summary>
          Can asset management software track education equipment ?
        </summary>

        <div className="education-faq-answer">
          Yes. Asset management software can track education equipment such as
          laptops, desktops, tablets, smart boards, projectors, laboratory
          instruments, servers, networking equipment, furniture, and other
          institutional assets. Each asset can be monitored by its location,
          status, assigned user, maintenance history, and lifecycle information.
        </div>
      </details>


      {/* FAQ 5 */}
      <details>
        <summary>
          Is asset management software useful for multiple branch ?
        </summary>

        <div className="education-faq-answer">
          Yes. A centralized asset management system is particularly useful for
          educational organizations operating across multiple branches,
          campuses, schools, or departments. It allows administrators to
          monitor assets across locations, manage transfers and assignments,
          track maintenance, and maintain centralized records from one
          dashboard.
        </div>
      </details>

    </div>

  </div>

</section>
</>
  )
}

export default Education