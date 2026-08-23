import React from "react";
import { useState , useEffect } from "react";
import { Link } from "react-router-dom";
import "../../Page_styles/LandingPage/Machinery.css"
import { Helmet } from "react-helmet-async";
const assetTypes = [
  "Electronic Assets Management",
  "Machinery Assets Management",
  "Transport Asset Management",
];

const faqData = [
  {
    question: "What is Machine asset management software?",
    answer:
      "Machine asset management software is a centralized system used to track, manage, and monitor physical machines and equipment throughout their entire lifecycle. It helps organizations record asset details such as purchase information, location, assignment, maintenance, warranty, insurance, operational status, and retirement."
  },
  {
    question:
      "What is the difference between hardware asset management and software asset management ?",
    answer:
      "Hardware asset management focuses on physical assets such as computers, machinery, equipment, servers, electronics, and other devices. Software asset management focuses on software licenses, subscriptions, applications, renewals, usage, and compliance. AssetPegasus can help organizations manage both physical and digital assets from a centralized platform."
  },
  {
    question:
      "What Machine assets should be tracked in an asset management system?",
    answer:
      "Organizations should track machines and equipment that are important to their operations, including production machinery, industrial equipment, tools, robotics, safety equipment, transport equipment, spare parts, and other physical assets. Important records can include asset identity, serial number, location, department, purchase cost, maintenance history, warranty, insurance, status, and lifecycle events."
  },
  {
    question:
      "Can hardware asset management software track warranty and insurance details?",
    answer:
      "Yes. Hardware asset management software can maintain warranty and insurance information alongside the asset record. Organizations can store policy details, coverage information, renewal dates, warranty periods, contract information, and related documents so important deadlines can be monitored more easily."
  },
  {
    question:
      "How does Machine asset tracking software help with maintenance management?",
    answer:
      "Machine asset tracking software provides a centralized record of maintenance activities and schedules. Teams can track previous maintenance, upcoming maintenance, service dates, maintenance costs, warranties, and other lifecycle events. Automated alerts can also help teams identify upcoming maintenance requirements and reduce the risk of missed service intervals."
  },
  {
    question:
      "Is AssetPegasus suitable for small businesses and IT teams without large budgets?",
    answer:
      "Yes. AssetPegasus is designed to be simple to use and scalable for organizations of different sizes. Small businesses can start with the assets and workflows they need and expand their asset management processes as the organization grows, without requiring a large dedicated IT asset management team."
  },
  {
    question:
      "Does AssetPegasus support hardware assets beyond standard IT equipment?",
    answer:
      "Yes. AssetPegasus is designed to manage more than traditional IT equipment. Organizations can use it to track machinery, industrial equipment, electronics, transport assets, tools, robotics, safety equipment, and other physical assets in addition to computers and standard IT hardware."
  },
  {
    question:
      "How is Machine asset management software different from using spreadsheets?",
    answer:
      "Spreadsheets can become difficult to maintain as the number of assets, locations, users, and lifecycle events increases. Machine asset management software provides a centralized system with structured asset records, assignments, locations, maintenance tracking, warranty and insurance information, alerts, reporting, and lifecycle visibility. This reduces manual tracking and makes asset information easier to access and manage."
  }
];


const leftCategories = [
    {
      icon: "💻",
      title: "User End Devices",
    },
    {
      icon: "🔒",
      title: "Security & Safety",
    },
    {
      icon: "🏭",
      title: "Machinery",
    },
    {
      icon: "🤖",
      title: "Robotics",
    },
  ];

  const rightCategories = [
    {
      icon: "🚚",
      title: "Transport",
    },
    {
      icon: "🛠️",
      title: "Equipment & Tools",
    },
    {
      icon: "🔌",
      title: "Electronics",
    },
    {
      icon: "🎧",
      title: "Accessories",
    },
  ];

const carouselItems = [
  {
    title: "One Platform for All Hardware and Non-IT",
    text: "Instead of using separate systems to monitor laptops, machinery, safety equipment and specialist assets, AssetPegasus brings everything together in one centralized platform."
  },
  {
    title: "Built for Small and Growing Businesses",
    text: "AssetPegasus provides a centralized asset management system that helps growing organizations keep track of equipment, maintenance, assignments and operational requirements."
  },
  {
    title: "Complete Asset Visibility",
    text: "Know where every asset is located, who is using it, what condition it is in and what maintenance or renewal activity is coming next."
  },
  {
    title: "Manage Machinery and IT Together",
    text: "Track computers, servers, machinery, tools, vehicles and other physical assets from one centralized asset management platform."
  }
];
const renewalSlides = [
  {
    title: "Machine Renewal Management Software",
    text: "Renewals get missed. Auto-renewing contracts are often signed at unfavourable rates. Support fails at the time of greatest need."
  },
  {
    title: "Machine Renewal Management Software",
    text: "Keep track of upcoming renewals and make informed decisions before contracts expire. AssetPegasus helps teams avoid unnecessary renewal costs."
  },
  {
    title: "Machine Renewal Management Software",
    text: "Get a clear view of renewal requirements and lifecycle information so your team can renew, replace, or retire assets at the right time."
  },
  {
    title: "Machine Renewal Management Software",
    text: "Reduce renewal expenses by reviewing contracts proactively and negotiating better terms with vendors before renewal dates arrive."
  }
];


const insuranceSlides = [
  {
    title: "Machine Insurance Management Software",
    text: "Automated renewal notices keep your staff informed so that no policy can expire without your knowledge — that way, no one will leave their hardware uninsured."
  },
  {
    title: "Centralized Insurance Records",
    text: "Keep insurance policies connected to individual assets with policy numbers, coverage information, insurer details, and important policy dates all in one place."
  },
  {
    title: "Insurance Renewal Tracking",
    text: "Stay ahead of policy renewals with automated reminders that help prevent accidental lapses in coverage and keep critical equipment protected."
  },
  {
    title: "Protect Every Type of Asset",
    text: "Manage insurance information for different types of assets, including machinery, factory equipment, IT hardware, and other valuable business property."
  },
  {
    title: "Complete Insurance Visibility",
    text: "Quickly review which assets are insured, their coverage details, renewal dates, and policy information so your organization can maintain better risk control."
  }
];


const slides = [
  {
    title: "How Hardware Asset Tracking Software Works",
    text: `Manual tracking of machine assets is considered as one of the most time consuming and
    error-prone projects in any IT department. A device is imposed without logging. An
    employer takes his employee to another office with his laptop. An item equipment would
    be sent back to storage without any data on the last user. They are not isolated cases,
    these occurrences happen weekly in organizations where they do not have a specific
    hardware asset tracking system in place.`
  },

  {
    title: "Centralize Your Hardware Asset Records",
    text: `AssetPegasus keeps hardware information organized in one centralized system.
    Track device identity, purchase information, assignment details, locations,
    maintenance records, warranty information, insurance policies and lifecycle status
    without relying on spreadsheets or manual records.`
  },

  {
    title: "Track Every Asset Throughout Its Lifecycle",
    text: `From procurement and registration to assignment, maintenance and disposal,
    AssetPegasus provides visibility into every stage of an asset's lifecycle.
    This helps organizations understand where their assets are, who is using them,
    and what condition they are currently in.`
  },

  {
    title: "Reduce Asset Tracking Errors",
    text: `Manual asset tracking can result in missing records, incorrect assignments
    and outdated information. A centralized asset management system reduces these
    errors by keeping asset information updated and accessible to authorized users
    whenever it is needed.`
  }
];

const maintenanceSlides = [
  {
    title: "Proactive Maintenance Scheduling",
    text: "AssetPegasus allows IT teams to create maintenance schedules for individual assets or entire asset categories, helping prevent unexpected equipment failures."
  },
  {
    title: "Automated Maintenance Reminders",
    text: "Receive timely reminders before scheduled services so maintenance teams never miss an important inspection or service appointment."
  },
  {
    title: "Complete Maintenance History",
    text: "Record every service performed on an asset along with technician notes, maintenance dates, and other important service information."
  },
  {
    title: "Track Maintenance Costs",
    text: "Monitor maintenance expenses for individual assets and understand how much your organization is spending throughout an asset's lifecycle."
  },
  {
    title: "Extend Hardware Lifespan",
    text: "Proactive maintenance helps identify potential problems early, reduce unexpected downtime, and extend the useful life of your hardware."
  }
];


const stats = [
  {
    value: "500+",
    label: "Companies Trust Our Solution",
  },
  {
    value: "95%",
    label: "Uptime Guarantee",
  },
  {
    value: "100%",
    label: "Automated Workflow",
  },
  {
    value: "2 in 1",
    label: "Hardware & Software",
  },
];
const trackingFeatures = [
  {
    title: "Device Identity",
    description:
      "Make, model, serial number, asset tag, and category",
  },
  {
    title: "Purchase Information",
    description:
      "Purchase date, purchase cost, vendor details, and warranty information",
  },
  {
    title: "Assignment & Location",
    description:
      "Track who has the asset, where it is located, and its assignment history",
  },
  {
    title: "Warranty Details",
    description:
      "Warranty coverage, expiry dates, renewal information, and alerts",
  },
  {
    title: "Maintenance History",
    description:
      "Maintenance schedules, service records, costs, and upcoming maintenance",
  },
  {
    title: "Insurance Policy",
    description:
      "Insurance provider, policy details, coverage, expiry dates, and renewals",
  },
  {
    title: "Lifecycle Status",
    description:
      "Track assets from purchase and deployment through maintenance and disposal",
  },
  {
    title: "Renewal Dates",
    description:
      "Monitor renewal deadlines and receive timely notifications",
  },
  {
    title: "Compliance Records",
    description:
      "Maintain important compliance information and regulatory records",
  },
];

// section 4 related images and information 

const section4Data = [
  {
    icon: "✅",
    title: "Easiest User experience",
    description:
      "Capture all types of assets details with easiest way.",
  },
  {
    icon: "🛡️",
    title: "Security & Risk Management",
    description:
      "Identify outdated software or unauthorized devices to fortify your organization’s security posture.",
  },
  {
    icon: "📊",
    title: "Complete Asset Visibility",
    description:
      "Get complete visibility into your organization's hardware, software, users, and asset lifecycle.",
  },
  {
    icon: "⚙️",
    title: "Simplified Asset Management",
    description:
      "Manage asset assignments, locations, maintenance, warranties, and lifecycle information from one place.",
  },
];

const section4Images = [
  "/images/info.webp",
  "/images/healthcare.webp",
  "/images/construction.webp",
  "/images/construction.webp",
];

// section 4 related data here 

const carouselContent = [
  {
    title: "Complete Warranty Tracking",
    text: "Track every warranty from purchase through expiration, including coverage details, warranty periods, and renewal information."
  },
  {
    title: "Never Miss an Expiry",
    text: "Receive automatic alerts before warranties expire so your team has enough time to renew coverage or plan a replacement."
  },
  {
    title: "Maintenance & Warranty History",
    text: "Keep warranty records connected with maintenance history, service records, and asset lifecycle information."
  },
  {
    title: "Reduce Unexpected Costs",
    text: "Avoid unnecessary repair expenses by knowing exactly which assets are covered and when their warranty protection ends."
  }
];


const MachineryHero = () => {
    const [assetTypeIndex, setAssetTypeIndex] = useState(0);
  const [featureIndex, setFeatureIndex] = useState(0);
   const [activeIndex, setActiveIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSlide2, setCurrentSlide2] = useState(0);
  const [currentSlide3, setCurrentSlide3] = useState(0);
  const [currentSlide4, setCurrentSlide4] = useState(0);
  const [currentSlide5, setCurrentSlide5] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [openIndex, setOpenIndex] = useState(null);
  // ---------------------------------------
  // TOP ASSET TYPE CAROUSEL
  // ---------------------------------------

  useEffect(() => {
    const interval = setInterval(() => {
      setAssetTypeIndex((prev) => (prev + 1) % assetTypes.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // ---------------------------------------
  // RIGHT FEATURE CAROUSEL
  // ---------------------------------------

  useEffect(() => {
    const interval = setInterval(() => {
      setFeatureIndex((prev) => (prev + 1) % trackingFeatures.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentFeature = trackingFeatures[featureIndex];

// section 4 carousel 
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % section4Data.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);


  // section 5 carousel 
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        (prev + 1) % carouselContent.length
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // section 7 carousel 

   useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide2((prev) =>
        (prev + 1) % maintenanceSlides.length
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // section 8 carousel 

   useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide3((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // section 9 carousel 

   useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide4(
        (prev) => (prev + 1) % insuranceSlides.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);


  // section 11 carousel 
   useEffect(() => {

    const interval = setInterval(() => {

      setCurrentSlide5((prev) =>
        (prev + 1) % renewalSlides.length
      );

    }, 4000);

    return () => clearInterval(interval);

  }, []);
  const slide = renewalSlides[currentSlide];

  // section 15 carousel 

   useEffect(() => {

    const interval = setInterval(() => {

      setActiveSlide((prev) =>
        (prev + 1) % carouselItems.length
      );

    }, 4000);

    return () => clearInterval(interval);

  }, []);

const handleNavigateItam = () => {
  window.open(
    "/it-asset-management",
    "_blank",
    "noopener,noreferrer"
  );
};

// section 18 faq 


  const toggleFaq = (index) => {
    setOpenIndex((current) =>
      current === index ? null : index
    );
  };
  return (
    <>
    <Helmet>
  <title>
    Machinery Asset Management Software | Track & Manage Equipment
  </title>

  <meta
    name="description"
    content="Manage and track machinery, equipment, maintenance, warranties, costs, and asset lifecycles with AssetPegasus machinery asset management software."
  />

  <meta
    name="robots"
    content="index, follow"
  />

  <meta
    property="og:type"
    content="website"
  />

  <meta
    property="og:title"
    content="Machinery Asset Management Software | AssetPegasus"
  />

  <meta
    property="og:description"
    content="Track machinery and equipment, manage maintenance schedules, monitor warranties and costs, and gain complete visibility across your asset lifecycle with AssetPegasus."
  />

  <meta
    property="og:image"
    content="https://assetpegasus.com/images/Dashboard.webp"
  />

  <meta
    property="og:url"
    content="https://assetpegasus.com/machinery"
  />

  <meta
    name="twitter:card"
    content="summary_large_image"
  />

  <meta
    name="twitter:title"
    content="Machinery Asset Management Software | AssetPegasus"
  />

  <meta
    name="twitter:description"
    content="Track machinery, equipment, maintenance, warranties, costs, and asset lifecycles with AssetPegasus."
  />

  <meta
    name="twitter:image"
    content="https://assetpegasus.com/images/Dashboard.webp"
  />

  <link
    rel="canonical"
    href="https://assetpegasus.com/machinery"
  />
</Helmet>


    <section className="machinery-hero">

      {/* Decorative clipped background layers */}
      <div className="hero-shape hero-shape-back"></div>
      <div className="hero-shape hero-shape-front"></div>

      <div className="machinery-hero-content">


        {/* Main Heading */}
        <h1>Machinery Assets Management</h1>
        {/* Breadcrumb */}
        <p className="machinery-breadcrumb">
          <Link to="/">Home</Link>
          <span> - </span>
          Machinery Assets Management Software
        </p>

        {/* Hero description */}
        <p className="machinery-hero-description">
          Smart machinery management software that scales with your
          business — AssetPegasus
        </p>

      </div>

    </section>

     <section className="machinery-section-2">

      <div className="machinery-section-2-inner">

        {/* SECTION HEADING */}
        <h2 className="machinery-section-2-title">
          Machinery Asset Management Software That Keeps Every Device
          Under Control
        </h2>

        <div className="machinery-section-2-content">

          {/* LEFT FEATURES */}
          <div className="machinery-features">

            <div className="machinery-feature">
              <span className="feature-icon">💼</span>

              <p>
                Track hardware from purchase to disposal,
                <br className="desktop-only" />
                zero gaps
              </p>
            </div>


            <div className="machinery-feature">
              <span className="feature-icon">🚨</span>

              <p>
                Automated warranty, maintenance &
                <br className="desktop-only" />
                renewal alerts.
              </p>
            </div>


            <div className="machinery-feature">
              <span className="feature-icon">🛡️</span>

              <p>
                GDPR & HIPAA compliant.
              </p>
            </div>


            <div className="machinery-feature">
              <span className="feature-icon">💳</span>

              <p>
                Start Free Trial
                <span className="feature-separator">—</span>
                No Credit Card Required
              </p>
            </div>

          </div>


          {/* RIGHT IMAGE */}
          <div className="machinery-product-image">

            <img
              src="/images/info.webp"
              alt="Machinery asset management dashboard"
            />

          </div>

        </div>

      </div>

    </section>

     <section className="asset-management-section-3">

      <div className="asset-management-section-3-inner">

        {/* =====================================
            TOP AUTO CAROUSEL
        ===================================== */}

        <div className="asset-type-carousel">

          <div
            key={assetTypeIndex}
            className="asset-type-title"
          >
            {assetTypes[assetTypeIndex]}
          </div>

          <div className="asset-type-dots">

            {assetTypes.map((_, index) => (
              <span
                key={index}
                className={
                  index === assetTypeIndex
                    ? "carousel-dot active"
                    : "carousel-dot"
                }
              />
            ))}

          </div>

        </div>


        {/* =====================================
            MAIN SECTION HEADING
        ===================================== */}

        <h2 className="asset-management-section-3-heading">
          What AssetPegasus Tracks for Every Machinery Assets
        </h2>


        {/* =====================================
            MAIN CONTENT
        ===================================== */}

        <div className="asset-management-section-3-content">

          {/* -----------------------------------
              LEFT SIDE
          ----------------------------------- */}

          <div className="asset-management-best-features">

            <h3>Best Features</h3>

            <div className="asset-feature-icons">
              <span>💻</span>
              <span>🔒</span>
              <span>⚙️</span>
              <span>🤖</span>
              <span>🚚</span>
              <span>🔧</span>
              <span>📐</span>
              <span>🎧</span>
            </div>

            <p>
              Device Identity, Purchase Information, Assignment &
              Location, Warranty Details, Maintenance History,
              Insurance Policy, Lifecycle Status, Renewal Dates,
              Compliance Records.
            </p>

            <button
              className="asset-management-signup"
              type="button"
              onClick={() => window.location.href = "/user/signup"}
            >
              Sign Up Now
            </button>

          </div>


          {/* -----------------------------------
              RIGHT FEATURE CAROUSEL
          ----------------------------------- */}

          <div className="asset-tracking-carousel">

            <div
              key={featureIndex}
              className="asset-tracking-feature"
            >

              <h3>
                {currentFeature.title}
              </h3>

              <p>
                {currentFeature.description}
              </p>

            </div>


            {/* Feature dots */}

            <div className="tracking-feature-dots">

              {trackingFeatures.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Show feature ${index + 1}`}
                  className={
                    index === featureIndex
                      ? "tracking-dot active"
                      : "tracking-dot"
                  }
                  onClick={() => setFeatureIndex(index)}
                />
              ))}

            </div>

          </div>

        </div>

      </div>

    </section>

      <section className="section4">

      <div className="section4-container">

        {/* LEFT CONTENT */}
        <div className="m-section4-content">

          <div className="section4-feature">
            <div className="section4-icon">
              {section4Data[activeIndex].icon}
            </div>

            <h2>
              {section4Data[activeIndex].title}
            </h2>

            <p>
              {section4Data[activeIndex].description}
            </p>
          </div>

        </div>


        {/* RIGHT IMAGE CAROUSEL */}
        <div className="section4-carousel">

          <div className="section4-image-wrapper">

            {section4Images.map((image, index) => (
              <img
                key={image}
                src={image}
                alt={`Asset management dashboard ${index + 1}`}
                className={
                  index === activeIndex
                    ? "section4-image active"
                    : "section4-image"
                }
              />
            ))}

          </div>


          {/* DOTS */}
          <div className="section4-dots">

            {section4Images.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                className={
                  index === activeIndex
                    ? "section4-dot active"
                    : "section4-dot"
                }
                onClick={() => setActiveIndex(index)}
              />
            ))}

          </div>

        </div>

      </div>

    </section>

    <section className="machinery-warranty-section">

      <div className="warranty-container">

        {/* LEFT SIDE */}
        <div className="warranty-features">

          <h3>Best Features</h3>

          <div className="feature-item">
            <span className="feature-icon">🚨</span>

            <p>
              Alerts to be sent out automatically after 90,
              60 and 30 days to expiry.
            </p>
          </div>

          <div className="feature-item">
            <span className="feature-icon">🔄</span>

            <p>
              Determine between renewals and replacements
              according to actual usage.
            </p>
          </div>

          <div className="feature-item">
            <span className="feature-icon">⏰</span>

            <p>
              Have warranty records as required by audit
              and compliance.
            </p>
          </div>

          <button className="warranty-cta">
            Start 7 Day Free Trial
          </button>

        </div>


        {/* RIGHT SIDE */}
        <div className="warranty-content">

          <h2>
            Machinery Warranty Management
            <br />
            Software
          </h2>

          <div className="warranty-carousel">

            <div
              className="warranty-slide"
              key={currentSlide}
            >
              <h3>
                {carouselContent[currentSlide].title}
              </h3>

              <p>
                {carouselContent[currentSlide].text}
              </p>
            </div>

          </div>


          {/* DOTS */}
          <div className="warranty-dots">

            {carouselContent.map((_, index) => (
              <button
                key={index}
                className={`warranty-dot ${
                  index === currentSlide ? "active" : ""
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />

            ))}

          </div>

        </div>

      </div>

    </section>

     <section className="section6-stats">

      <div className="section7-container">

        {stats.map((stat, index) => (
          <div className="section6-stat" key={index}>

            <div className="section6-value">
              {stat.value}
            </div>

            <p className="section6-label">
              {stat.label}
            </p>

          </div>
        ))}

      </div>

    </section>

      <section className="maintenance-section">

      <div className="maintenance-container">

        {/* LEFT SIDE */}
        <div className="maintenance-features">

          <h3>Best Features</h3>

          <div className="maintenance-feature">
            <span>⏰</span>
            <p>
              Identify the custom maintenance schedules of each
              asset or asset category.
            </p>
          </div>

          <div className="maintenance-feature">
            <span>🤖</span>
            <p>
              Robotic reminders prior to each service appointment.
            </p>
          </div>

          <div className="maintenance-feature">
            <span>📊</span>
            <p>
              Record all services on maintenance with complete
              technician notes.
            </p>
          </div>

          <div className="maintenance-feature">
            <span>💰</span>
            <p>
              Costs of tracking maintenance of an asset.
            </p>
          </div>

          <div className="maintenance-feature">
            <span>🚀</span>
            <p>
              Expand hardware life through proactive maintenance
              services.
            </p>
          </div>

          <button className="maintenance-cta">
            Free Trial – No Card Required
          </button>

        </div>


        {/* RIGHT SIDE */}
        <div className="maintenance-content">

          <h2>
            Machinery Maintenance Management
            <br />
            Software
          </h2>

          <div className="maintenance-carousel">

            <div
              className="maintenance-slide"
              key={currentSlide}
            >

              <h3>
                {maintenanceSlides[currentSlide].title}
              </h3>

              <p>
                {maintenanceSlides[currentSlide].text}
              </p>

            </div>

          </div>


          {/* CAROUSEL DOTS */}
          <div className="maintenance-dots">

            {maintenanceSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`maintenance-dot ${
                  index === currentSlide ? "active" : ""
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Show maintenance slide ${index + 1}`}
              />
            ))}

          </div>

        </div>

      </div>

    </section>

    <section className="section8">

      {/* Clipped background decoration */}
      <div className="section8-clip-bg"></div>

      <div className="m-section8-container">

        <div
          className="section8-slide"
          key={currentSlide}
        >

          <h2>
            {slides[currentSlide].title}
          </h2>

          <p>
            {slides[currentSlide].text}
          </p>

        </div>


        {/* Carousel dots */}
        <div className="m-section8-dots">

          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`section8-dot ${
                index === currentSlide ? "active" : ""
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Show slide ${index + 1}`}
            />

          ))}

        </div>

      </div>

    </section>

    <section className="section9">

      <div className="section9-container">

        {/* =========================
            LEFT FEATURES
        ========================= */}

        <div className="section9-features">

          <h3>Best Features</h3>

          <div className="section9-feature">
            <span>📜</span>

            <p>
              Bond insurance policies directly with each asset.
            </p>
          </div>

          <div className="section9-feature">
            <span>🗓️</span>

            <p>
              Name and policy number and full coverage of store
              insurer.
            </p>
          </div>

          <div className="section9-feature">
            <span>🔄</span>

            <p>
              Renewal reminders to avoid accidental lapses in
              coverage.
            </p>
          </div>

          <div className="section9-feature">
            <span>🌐</span>

            <p>
              Oversee insurance to all types of assets such as
              factory equipment.
            </p>
          </div>

          <button
            type="button"
            className="section9-cta"
          >
            Sign Up – Free Trial
          </button>

        </div>


        {/* =========================
            RIGHT CAROUSEL
        ========================= */}

        <div className="section9-content">

          <div
            className="section9-slide"
            key={currentSlide}
          >

            <h2>
              {insuranceSlides[currentSlide].title}
            </h2>

            <p>
              {insuranceSlides[currentSlide].text}
            </p>

          </div>


          {/* =========================
              DOTS
          ========================= */}

          <div className="section9-dots">

            {insuranceSlides.map((_, index) => (

              <button
                key={index}
                type="button"
                className={`section9-dot ${
                  index === currentSlide
                    ? "active"
                    : ""
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Show insurance slide ${
                  index + 1
                }`}
              />

            ))}

          </div>

        </div>

      </div>

    </section>

     <section className="machinery-section10">

      <div className="section10-container">

        {/* LEFT CONTENT */}
        <div className="section10-content">

          <h2>Machine Asset Management System for IT Teams</h2>

          <p>
            The Machine asset management system offered by Socialfly AMS
            to the IT managers and system administrators gives them the
            central command centre in all the hardware decisions. Live
            dashboards indicate the status and position of each asset
            present within the estate as well as its health.
          </p>

          <p>
            Lifecycle alerts will make sure that no device will expire at
            any point of the warranty, maintenance or life expectancy
            without prior information of the team. Auto discovery feature
            scans your network and finds out automatically connected
            devices that are part of it.
          </p>

          <p>
            So far without the manual hassle of registering assets, that
            is, in typical IT hardware. As and when new devices get
            connected with the network, they are shown in the inventory
            with all the hardware specifications, operating system, and
            configuration data.
          </p>

        </div>

        {/* RIGHT IMAGE */}
        <div className="section10-image">
          <img
            src="/images/upcoming.png"
            alt="Upcoming hardware warranty tracking dashboard"
          />
        </div>

      </div>

    </section>

    <section className="machinery-section11">

      <div className="section11-container">

        {/* LEFT SIDE */}
        <div className="section11-features">

          <h3>Best Features</h3>

          <div className="section11-feature">
            <span>🏭</span>
            <p>
              Aggregated hardware assets renewals calendar.
            </p>
          </div>

          <div className="section11-feature">
            <span>⏰</span>
            <p>
              12-month perspective of all renewal requirements.
            </p>
          </div>

          <div className="section11-feature">
            <span>🤖</span>
            <p>
              Automation of a notification every time before a renewal.
            </p>
          </div>

          <div className="section11-feature">
            <span>♻️</span>
            <p>
              Informed renewal / retire decision with lifecycle information.
            </p>
          </div>

          <div className="section11-feature">
            <span>📈</span>
            <p>
              Cut down renewal expenses by negotiating the deal with the vendor proactively.
            </p>
          </div>

          <button className="section11-cta">
            Free Trial
          </button>

        </div>


        {/* RIGHT SIDE */}
        <div className="section11-carousel">

          <div
            className="section11-slide"
            key={currentSlide}
          >

            <h2>
              {slide.title}
            </h2>

            <p>
              {slide.text}
            </p>

          </div>


          {/* DOTS */}
          <div className="section11-dots">

            {renewalSlides.map((_, index) => (

              <button
                key={index}
                className={
                  index === currentSlide
                    ? "section11-dot active"
                    : "section11-dot"
                }
                onClick={() => setCurrentSlide(index)}
                aria-label={`Show renewal slide ${index + 1}`}
              />

            ))}

          </div>

        </div>

      </div>

    </section>

     <section className="section12">

      <div className="section12-container">

        {/* LEFT CONTENT */}
        <div className="section12-content">

          <h2>
            Machine Asset Management for Non
            <br />
            – IT Physical Equipment
          </h2>

          <p>
            Contrary to the majority of IT asset management tools,
            the AssetPegasus goes beyond the conventional IT domain in
            tracking Machines.
          </p>

          <p>
            This could be factory machines, production equipment, safety
            devices, and special equipment used within the machines of
            specialists, which could be tracked within the same platform
            with normal IT assets.
          </p>

          <p>
            This renders AssetPegasus the only solution of unique importance
            to manufacturing companies, logistics, healthcare, or any other
            company that is expected to control not only its IT system but
            also its physical working devices with one unified system,
            without having to also pay for two different systems.
          </p>

        </div>


        {/* RIGHT IMAGE */}
        <div className="section12-image">

          <img
            src="/images/inventory.png"
            alt="AssetPegasus machine asset management system"
          />

        </div>

      </div>

    </section>

    <section className="section13">

      <div className="section13-container">

        {/* LEFT COLUMN */}
        <div className="section13-column">

          <h2>
            AssetPegasus, you can manage
          </h2>

          <ul>
            <li>🚚 Company vehicles (cars, vans, trucks)</li>

            <li>📦 Delivery fleets</li>

            <li>🏭 Warehouse transport equipment (forklifts, pallet movers)</li>

            <li>🚐 Field service vehicles</li>

            <li>📍 GPS enabled tracking devices</li>

            <li>🔌 EV charging equipment and batteries</li>
          </ul>

        </div>


        {/* RIGHT COLUMN */}
        <div className="section13-column">

          <h2>
            Each asset record includes
          </h2>

          <ul>
            <li>📜 Insurance details and ownership</li>

            <li>🛠️ Maintenance schedules (servicing, inspections)</li>

            <li>🏭 Warehouse transport equipment (forklifts, pallet movers)</li>

            <li>📑 Insurance policies and renewals</li>

            <li>👥 Assigned driver or team</li>

            <li>🔔 Lifecycle status (active, under repair, retired)</li>
          </ul>

        </div>

      </div>

    </section>


    <section className="machinery-cloud-section">
      <div className="machinery-cloud-content">

        <h2>
          Cloud Based Machinery Assets Management — Access From Anywhere
        </h2>

        <p>
          <span className="highlight-text">AssetPegasus</span> is a hardware
          management system that is a fully cloud based solution. No software
          needs to be installed on the local machines, no servers to be
          maintained and no data to be backed up manually.
        </p>

        <p>
          Your whole inventory of assets of hardware could be easily gained in
          any location, anywhere on the globe, under the protection of any
          device and providing distributed teams, remote IT director, and
          organization with the sites with equal access as a one-office team.
        </p>

        <p>
          In the case of organizations with stringent data residency policies,
          <span className="highlight-text"> AssetPegasus</span> can also allow
          on-premise and hybrid deployment to take place as well — you know it
          is all there under your control also in where your data on assets are
          kept.
        </p>

      </div>
    </section>

     <section className="machinery-choose-section">

      <div className="machinery-choose-container">

        {/* =========================
            LEFT SIDE
        ========================= */}

        <div className="machinery-features">

          <p className="features-label">
            Best Features
          </p>

          <ul>

            <li>
              <span className="feature-icon">🌐</span>
              <span>
                One Platform for ALL Hardware IT and Non IT.
              </span>
            </li>

            <li>
              <span className="feature-icon">🚨</span>
              <span>
                Automated Alerts Never Miss Deadline.
              </span>
            </li>

            <li>
              <span className="feature-icon">✉️</span>
              <span>
                Compliance Ready Always.
              </span>
            </li>

            <li>
              <span className="feature-icon">✅</span>
              <span>
                Simple to Set Up, Easy to Use Every Day.
              </span>
            </li>

          </ul>

          <a
            href="/user/signup"
            className="machinery-trial-btn"
          >
            Free Trial — Try Now
          </a>

        </div>


        {/* =========================
            RIGHT CAROUSEL
        ========================= */}

        <div className="machinery-info-carousel">

          <h2>
            Why Teams Choose AssetPegasus for Machinery Assets Management
          </h2>

          <div className="carousel-window">

            <div
              className="carousel-track"
              style={{
                transform: `translateX(-${activeSlide * 100}%)`
              }}
            >

              {carouselItems.map((item, index) => (

                <div
                  className="carousel-slide"
                  key={index}
                >

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.text}
                  </p>

                </div>

              ))}

            </div>

          </div>


          {/* CAROUSEL DOTS */}

          <div className="carousel-dots">

            {carouselItems.map((_, index) => (

              <button
                key={index}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                className={
                  activeSlide === index
                    ? "carousel-dot active"
                    : "carousel-dot"
                }
                onClick={() => setActiveSlide(index)}
              />

            ))}

          </div>

        </div>

      </div>

    </section>

     <section className="why-businesses-section">
      <div className="why-businesses-content">

        <h2>
          Why Businesses Choose AssetPegasus
        </h2>

        <h3>
          8+ Years of Building Digital Success Stories.
        </h3>

        <p>
          Small, Medium &amp; Big Organizations require a simple flexible
          and scalable asset management platform which capable of managing
          complex asset environments.
        </p>

        <p>
          <a
            href="/about"
            className="ham-link"
          >
            HAM &amp; ITAM
          </a>{" "}
          we bring all that expertise into a single SaaS
          (Software as Service) platform that helps to Manage Businesses &amp;
          Individuals.
        </p>

        <a
          href="/about"
          className="about-us-btn"
        >
          About Us
        </a>

      </div>
    </section>

     <section className="asset-categories-section">

      <div className="asset-categories-container">

        {/* =================================
            LEFT CATEGORIES
        ================================= */}

        <div className="asset-category-column left-column">

          {leftCategories.map((item, index) => (
            <div
              className="asset-category-item"
              key={index}
            >
              <span className="asset-category-icon">
                {item.icon}
              </span>

              <span className="asset-category-title">
                {item.title}
              </span>
            </div>
          ))}

        </div>


        {/* =================================
            CENTER VIDEO
        ================================= */}

        <div className="asset-category-video">

          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source
              src="/videos/hardware.mp4"
              type="video/mp4"
            />

            Your browser does not support the video tag.
          </video>

        </div>


        {/* =================================
            RIGHT CATEGORIES
        ================================= */}

        <div className="asset-category-column right-column">

          {rightCategories.map((item, index) => (
            <div
              className="asset-category-item"
              key={index}
            >
              <span className="asset-category-icon">
                {item.icon}
              </span>

              <span className="asset-category-title">
                {item.title}
              </span>
            </div>
          ))}

        </div>

      </div>

    </section>

     <section className="section17">

      {/* =====================================
          TOP PRICING SECTION
      ===================================== */}

      <div className="section17-pricing">

        <div className="section17-pricing-label">
          Pricing
        </div>

        <div className="section17-pricing-card" onClick={handleNavigateItam}>

          <div className="section17-icon">
            <span>◇</span>
          </div>

          <h2>IT Asset Management</h2>

          <p>
            Manage All types of Digital Assets From One Place —
            <br />
            Softwares, Servers, Domains &amp; Clouds etc.
          </p>

        </div>

      </div>


      {/* =====================================
          BOTTOM CTA SECTION
      ===================================== */}

      <div className="section17-cta">

        <h2>
          Machinery Assets Management System
        </h2>

        <a
          href="/user/signup"
          className="section17-signup"
        >
          Sign Up Now
          <span>→</span>
        </a>

      </div>

    </section>

    <section className="section18-faq">

      <div className="section18-container">

        <h2 className="section18-title">
          FAQ (Frequently Asked Questions)
        </h2>

        <div className="section18-list">

          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                className={`section18-item ${
                  isOpen ? "section18-item-open" : ""
                }`}
                key={index}
              >

                <button
                  type="button"
                  className="section18-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span className="section18-arrow">
                    {isOpen ? "▼" : "▶"}
                  </span>

                  <span>{faq.question}</span>
                </button>

                <div
                  className={`section18-answer ${
                    isOpen ? "section18-answer-open" : ""
                  }`}
                >
                  <p>{faq.answer}</p>
                </div>

              </div>
            );
          })}

        </div>

      </div>

    </section>
    </>
  );
};

export default MachineryHero;