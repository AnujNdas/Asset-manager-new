import React from 'react'
import "../../Page_styles/LandingPage/Construction.css"

import { useState , useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductFeatures from '../../Components/Mainpage/ProductFeature';
import { FaBook, FaHospital, FaBuilding } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
const constructionSlides = [
  {
    title: "Free Trial — No Card Required",
    heading: (
      <>
        These systems<br />
        can assist companies:
      </>
    ),
    items: [
      "Improve maintenance scheduling",
      "Optimize equipment utilization",
      "Improve project coordination",
      "Maintain compliance records",
    ],
  },

  // slide 2
  {
    title: "Track Construction Assets",
    heading: "Complete Asset Visibility",
    items: [
      "Track equipment across job sites",
      "Monitor asset locations",
      "Reduce equipment loss",
      "Improve utilization",
    ],
  },

  // slide 3
  {
    title: "Smarter Construction Operations",
    heading: "Improve Operational Efficiency",
    items: [
      "Automate maintenance schedules",
      "Monitor equipment condition",
      "Reduce unexpected downtime",
      "Maintain compliance records",
    ],
  },
];

const constructionAnalyticsSlides = [
  {
    title: "Benefits of Construction Equipment Tracking",
    heading: "Increased Operational Efficiency",
    description:
      "Manual tracking and labor are minimized with automation.",
  },
  {
    title: "Benefits of Construction Equipment Tracking",
    heading: "Reduced Equipment Downtime",
    description:
      "Preventive maintenance schedules and automated service reminders help reduce unexpected equipment failures.",
  },
  {
    title: "Benefits of Construction Equipment Tracking",
    heading: "Better Equipment Utilization",
    description:
      "Track equipment usage across multiple construction sites and make better decisions about asset allocation.",
  },
  {
    title: "Benefits of Construction Equipment Tracking",
    heading: "Improved Project Coordination",
    description:
      "Centralized equipment information helps project managers coordinate machinery, tools and resources more efficiently.",
  },
  {
    title: "Benefits of Construction Equipment Tracking",
    heading: "Lower Operating Costs",
    description:
      "Monitor maintenance, downtime and lifecycle costs to reduce unnecessary construction equipment expenses.",
  },
];
const constructionSection8Slides = [
  {
    image: "/images/info.webp",
  },
  {
    image: "/images/construction.webp",
  },
  {
    image: "/images/healthcare.webp",
  },
];
const constructionSection7Slides = [
  {
    title: "The Future of Construction Asset Tracking",
    text: `Their industry is embracing AI, internet of things (IoT) monitoring,
    predictive maintenance and cloud asset management platforms at a fast pace.
    Intelligent tracking systems have become more and more popular in modern
    businesses to make their operations more efficient to cut down downtime
    and optimize resources utilization.`,
  },
  {
    title: "Smarter Construction Asset Management",
    text: `Modern construction businesses can use centralized asset management
    systems to monitor equipment, machinery and vehicles across multiple
    construction sites while improving visibility and operational control.`,
  },
  {
    title: "Predictive Maintenance & Equipment Visibility",
    text: `Predictive maintenance helps construction companies identify upcoming
    maintenance requirements, reduce unexpected equipment failures and keep
    critical machinery available when it is needed.`,
  },
  {
    title: "Cloud-Based Construction Asset Tracking",
    text: `Cloud-based asset management gives project managers real-time visibility
    into equipment locations, maintenance schedules, utilization and asset
    lifecycle information from a single platform.`,
  },
];


const constructionSection6Slides = [
  {
    title: "Key Metrics",
    intro: "Key metrics to track using analytics:",
    items: [
      "Asset utilization",
      "Maintenance costs",
      "Equipment performance",
      "Downtime trends",
    ],
    ending: "Make informed operational and boost project profitability.",
  },

  {
    title: "Construction Equipment Tracking",
    intro:
      "Contemporary construction projects combine numerous technologies and methods to manage assets.",
    items: [
      "Companies can use tracking to determine what type of equipment is going where.",
      "Mobile ready systems allow users to update records, conduct inspections and manage assets from anywhere.",
    ],
    ending: "Improve visibility and keep construction projects moving.",
  },

  {
    title: "Preventive Maintenance",
    intro:
      "Construction asset management helps teams stay ahead of equipment maintenance.",
    items: [
      "Schedule preventive maintenance",
      "Monitor equipment condition",
      "Track inspections and repairs",
      "Reduce unexpected equipment downtime",
    ],
    ending: "Extend equipment life and reduce project delays.",
  },
];
const Construction = () => {
    const navigate = useNavigate();
    const [constructionSlide, setConstructionSlide] = useState(0);
    const [constructionSection6Slide, setConstructionSection6Slide] = useState(0);
    const [constructionSection7Slide, setConstructionSection7Slide] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [constructionAnalyticsSlide, setConstructionAnalyticsSlide] =
  useState(0);


    // carousel for section 4 

    useEffect(() => {
  const interval = setInterval(() => {
    setConstructionSlide((prev) =>
      (prev + 1) % constructionSlides.length
    );
  }, 4000); // changes every 4 seconds

  return () => clearInterval(interval);
}, []);

// section 6 carousel 

useEffect(() => {
  const interval = setInterval(() => {
    setConstructionSection6Slide((prev) => {
      return (prev + 1) % constructionSection6Slides.length;
    });
  }, 4000);

  return () => clearInterval(interval);
}, []);

// section 7 carousel 

useEffect(() => {
  const interval = setInterval(() => {
    setConstructionSection7Slide((prev) =>
      (prev + 1) % constructionSection7Slides.length
    );
  }, 5000);

  return () => clearInterval(interval);
}, []);

  // Automatic carousel section 8
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        (prev + 1) % constructionSection8Slides.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

// section 10 carousel 
  useEffect(() => {
  const interval = setInterval(() => {
    setConstructionAnalyticsSlide(
      (prev) => (prev + 1) % constructionAnalyticsSlides.length
    );
  }, 4000);

  return () => clearInterval(interval);
}, []);

const handleSignIn = () => {
    navigate("/user/signup")
}
    return (
        <>

        <Helmet>

        {/* =========================
            BASIC SEO
        ========================= */}

        <title>
          Construction Equipment Tracking Software | AssetPegasus
        </title>

        <meta
          name="description"
          content="Track and manage construction equipment, machinery, maintenance, locations, costs, assignments and asset lifecycles with AssetPegasus."
        />

        <meta
          name="keywords"
          content="construction equipment tracking software, construction asset management software, construction equipment management, equipment tracking software, construction machinery tracking, heavy equipment management, construction asset tracking, equipment lifecycle management"
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <link
          rel="canonical"
          href="https://assetpegasus.com/construction-equipment-tracking"
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
          content="Construction Equipment Tracking Software | AssetPegasus"
        />

        <meta
          property="og:description"
          content="Track and manage construction equipment, machinery, maintenance, locations, costs and complete asset lifecycles with AssetPegasus."
        />

        <meta
          property="og:url"
          content="https://assetpegasus.com/construction-equipment-tracking"
        />

        <meta
          property="og:site_name"
          content="AssetPegasus"
        />

        <meta
          property="og:image"
          content="https://assetpegasus.com/images/construction.webp"
        />

        <meta
          property="og:image:alt"
          content="Construction Equipment Tracking Software"
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
          content="Construction Equipment Tracking Software | AssetPegasus"
        />

        <meta
          name="twitter:description"
          content="Track construction equipment, machinery, maintenance, locations, costs and complete asset lifecycles with AssetPegasus."
        />

        <meta
          name="twitter:url"
          content="https://assetpegasus.com/construction-equipment-tracking"
        />

        <meta
          name="twitter:image"
          content="https://assetpegasus.com/images/construction.webp"
        />

        <meta
          name="twitter:image:alt"
          content="Construction Equipment Tracking Software"
        />

      </Helmet>



            <section className="construction-section-1">

                {/* Dark upper hero area */}
                <div className="construction-section-1-top">

                    <h1>
                        Construction Equipment Tracking
                    </h1>

                </div>

                {/* Lower area with breadcrumb */}
                <div className="construction-section-1-bottom">

                    <div className="construction-breadcrumb">
                        <Link to="/"   target="_blank"
  rel="noopener noreferrer">Home</Link>
                        <span> - </span>
                        <span>Construction Equipment Tracking</span>
                    </div>

                </div>

            </section>

            <section className="construction-section-2">

  <div className="construction-section-2-content">

    <h2>
      AssetPegasus – Simple Construction Equipment Tracking
      <br />
      that Scales With Your Business.
    </h2>

    <div className="construction-section-2-text">

      <p>
        The construction industry is in a fast-paced business with the constant
        movement of equipment, machinery, tools and vehicles between
        construction jobs, storage yards, and jobs in operation. These assets
        can be hard to oversee manually and quite often result in delays, lost
        equipment, downtime and increased operating expenses. A construction
        and equipment tracking can be effective in terms of complete asset
        visibility across the business and better productivity, safety and
        efficiency.
      </p>

      <p>
        State of the art construction asset management systems feature
        technologies – QR codes, and cloud-based dashboards, to facilitate real
        time monitoring of assets. Such systems provide construction companies
        with a way to monitor the location of its equipment, its maintenance
        schedule, the utilization of those assets, and minimize the risk
        associated with its use across multiple job sites.
      </p>

    </div>

  </div>

</section>

<section className="construction-section-3">

  <div className="construction-section-3-image-wrapper">
    <img
      src="/images/Constructionpage.webp"
      alt="Construction Equipment Asset Management Dashboard"
      className="construction-section-3-image"
    />
  </div>

</section>

<section className="construction-section-4">

  {/* LEFT SIDE */}
  <div className="construction-section-4-left">

    <h2>Best Features</h2>

    <ul>
      <li>☁️ Cloud, Hybrid &amp; On Premise Deployment Options.</li>
      <li>🛡️ GDPR &amp; HIPAA Compliant.</li>
      <li>💳 No Credit Card Required. Start with 7 Days Free Trial.</li>
      <li>🎯 Track Every single Asset Across Its Full Lifecycle.</li>
      <li>🚨 Proactive Alerts for Security Risks, Expirations &amp; Changes.</li>
      <li>🤖 Automate License Reporting and Renewals.</li>
      <li>⏱️ Unlock Modern Inventory &amp; with Best Visibility.</li>
    </ul>

    <Link className="construction-section-4-trial-btn" to="/user/signup" 
      target="_blank"
  rel="noopener noreferrer">
      Free Trial
    </Link>

  </div>


  {/* RIGHT SIDE CAROUSEL */}
 <div className="construction-section-4-right">

  <div className="construction-section-4-carousel">

    <div className="construction-section-4-slide">

      <h2>
        {constructionSlides[constructionSlide].title}
      </h2>

      <Link to="/user/signup"
        target="_blank"
  rel="noopener noreferrer"
      className="construction-section-4-signup-btn">
        Sign Up
      </Link>

      <div className="construction-section-4-slide-content">

        <h3>
          {constructionSlides[constructionSlide].heading}
        </h3>

        <ul>
          {constructionSlides[constructionSlide].items.map(
            (item, index) => (
              <li key={index}>
                {item}
              </li>
            )
          )}
        </ul>

      </div>

    </div>

  </div>

  <div className="construction-section-4-dots">

    {constructionSlides.map((_, index) => (
      <span
        key={index}
        className={`construction-section-4-dot ${
          constructionSlide === index ? "active" : ""
        }`}
        onClick={() => setConstructionSlide(index)}
      />
    ))}

  </div>

</div>

</section>

<section className="construction-section-5">

  {/* TOP CONTENT */}
  <div className="construction-section-5-top">

    <h2>
      What Is Construction Equipment Tracking?
    </h2>

    <p>
      Businesses engaged in construction are likely to have a lot of costly
      machinery being used at various construction sites at once. Without a
      central system, there is potential for equipment being lost, under
      utilized and missing when it is needed.
    </p>

    <p>
      The benefit of the construction asset management is better visibility
      of functions at work. Project managers can see at a moment’s notice
      the exact location of equipment, the person operating it, and if it’s
      in operation or under maintenance. This will provide greater
      transparency of scheduling and increased efficiency in the project.
    </p>

  </div>


  {/* BOTTOM CONTENT */}
  <div className="construction-section-5-bottom">

    {/* LEFT */}
    <div className="construction-section-5-left">

      <p className="construction-section-5-label">
        Asset management software can aid businesses:
      </p>

      <p>
        Equipment theft is also a serious problem in the construction
        industry. Location assign capabilities enable companies to track
        and alert to any unauthorized movement, helping to mitigate
        financial losses at a more rapid rate.
      </p>

    </div>


    {/* RIGHT */}
    <div className="construction-section-5-right">

      <h3>
        Reduced Equipment Downtime
      </h3>

      <p>
        <span className="construction-section-5-arrow">▶</span>
        Downtime also can be significantly curtailed by preventive
        maintenance. Rolling out automated service reminders, maintenance
        schedules, inspection and repair tracking reduce unexpected
        equipment failure on-site and extend the equipment’s life.
      </p>

    </div>

  </div>

</section>

<section className="construction-section-6">

  {/* SECTION HEADING */}
  <div className="construction-section-6-header">
    <h2>
      Key Features of Construction Asset Management Software
    </h2>
  </div>


  <div className="construction-section-6-content">

    {/* =====================================
        LEFT FIXED CONTENT
    ===================================== */}

    <div className="construction-section-6-left">

      <div className="construction-feature">

        <h3>
          <span>•</span> Real Time Asset Tracking
        </h3>

        <p>
          Track the condition, location and status of equipment
          <br />
          real time.
        </p>

      </div>


      <div className="construction-feature">

        <h3>
          <span>•</span> QR Code Tracking
        </h3>

        <p>
          Instantly scan assets while using mobile devices to
          <br />
          update asset data.
        </p>

      </div>


      <div className="construction-feature">

        <h3>
          <span>•</span> Preventive Maintenance Scheduling
        </h3>

        <p>
          Programmed alerts for maintenance to minimise
          <br />
          equipment downtime.
        </p>

      </div>

    </div>


    {/* =====================================
        RIGHT AUTOMATIC CAROUSEL
    ===================================== */}

    <div className="construction-section-6-right">

      <div className="construction-section-6-carousel">

        <div
          className="construction-section-6-track"
          style={{
            transform: `translateX(-${
              constructionSection6Slide * 100
            }%)`,
          }}
        >

          {constructionSection6Slides.map((slide, index) => (

            <div
              className="construction-section-6-slide"
              key={index}
            >

              <h2>
                {slide.title}
              </h2>

              <p className="construction-section-6-intro">
                {slide.intro}
              </p>

              <ul>
                {slide.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    {item}
                  </li>
                ))}
              </ul>

              <p className="construction-section-6-ending">
                {slide.ending}
              </p>

            </div>

          ))}

        </div>

      </div>


      {/* =====================================
          DOTS
      ===================================== */}

      <div className="construction-section-6-dots">

        {constructionSection6Slides.map((_, index) => (

          <span
            key={index}
            className={`construction-section-6-dot ${
              constructionSection6Slide === index
                ? "active"
                : ""
            }`}
            onClick={() =>
              setConstructionSection6Slide(index)
            }
          />

        ))}

      </div>


      {/* SIGN UP */}
      <Link to="/user/signup"
        target="_blank"
  rel="noopener noreferrer"
      className="construction-section-6-signup">
        Sign Up Now
      </Link>

    </div>

  </div>

</section>

<section className="construction-section-7">

  <div className="construction-section-7-content">

    <h2>
      Construction Equipment Tracking with Assetpegasus
    </h2>

    <p className="construction-section-7-intro">
      AssetPegasus built, modern and scalable construction asset management
      solution for businesses to simply manage, monitor and track across
      multiple sites.
    </p>

    <div className="construction-section-7-carousel">

      <div className="construction-section-7-slide">

        <h3>
          {constructionSection7Slides[constructionSection7Slide].title}
        </h3>

        <p>
          {constructionSection7Slides[constructionSection7Slide].text}
        </p>

      </div>

      <div className="construction-section-7-dots">
        {constructionSection7Slides.map((_, index) => (
          <button
            key={index}
            className={
              index === constructionSection7Slide
                ? "construction-section-7-dot active"
                : "construction-section-7-dot"
            }
            onClick={() => setConstructionSection7Slide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <Link
        className="construction-section-7-signin"
          target="_blank"
  rel="noopener noreferrer"
  to="/user/signup"
      >
        Sign Up Now
      </Link>

    </div>

  </div>

  {/* Bottom mountain clip */}
  <div className="construction-section-7-bottom-clip"></div>

</section>

<section className="construction-section-8">

      {/* LEFT */}
      <div className="construction-section-8-left">

        <h2>
          The Future of Construction & Real Estate Asset Management
        </h2>

        <div className="construction-section-8-list">

          <p>The Construction industry is rapidly adopting:</p>

          <div className="construction-section-8-item">
            <span className="construction-check">✓</span>
            <span>Cloud based management systems</span>
          </div>

          <div className="construction-section-8-item">
            <span className="construction-check">✓</span>
            <span>Smart maintenance automation</span>
          </div>

          <div className="construction-section-8-item">
            <span className="construction-check">✓</span>
            <span>Mobile first operations</span>
          </div>

          <div className="construction-section-8-item">
            <span className="construction-check">✓</span>
            <span>Real-time operational dashboards</span>
          </div>

        </div>
      </div>


      {/* RIGHT CAROUSEL */}
      <div className="construction-section-8-right">

        <div className="construction-section-8-image-wrapper">

          {constructionSection8Slides.map((slide, index) => (
            <img
              key={index}
              src={slide.image}
              alt="Construction asset management dashboard"
              className={`construction-section-8-image ${
                index === currentSlide ? "active" : ""
              }`}
            />
          ))}

        </div>

        {/* DOTS */}
        <div className="construction-section-8-dots">

          {constructionSection8Slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`construction-section-8-dot ${
                index === currentSlide ? "active" : ""
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}

        </div>

      </div>

    </section>

    <section className="construction-section-9">

  <div className="construction-section-9-content">

    <p>
      Effective asset management systems are essential for today’s
      construction enterprises to remain competitive, improve project
      efficiency, and boost their operational performance.
    </p>

    <p>
      The constantly changing demands of construction projects mean that
      asset management software will be instrumental in ensuring that
      construction businesses operate effectively with reduced resources
      and improved equipment utilization.
    </p>

  </div>

  <div className="construction-section-9-stats">

    <div className="construction-section-9-stat">
      <h2>500+</h2>
      <p>
        Companies Trust Our
        <br />
        Solution
      </p>
    </div>

    <div className="construction-section-9-stat">
      <h2>95%</h2>
      <p>Uptime Guarantee</p>
    </div>

    <div className="construction-section-9-stat">
      <h2>100%</h2>
      <p>Automated Workflow</p>
    </div>

    <div className="construction-section-9-stat">
      <h2>100%</h2>
      <p>
        GDPR &amp; HIPAA
        <br />
        Compliant
      </p>
    </div>

  </div>

</section>

<section className="construction-section-10">

  {/* LEFT SIDE */}
  <div className="construction-section-10-left">

    <h2>Analytics &amp; Reporting</h2>

    <p>
      Advanced reporting in its turn
      <br />
      further assists management to analyse:
    </p>

    <ul>
      <li>Asset utilization</li>
      <li>Maintenance costs</li>
      <li>Downtime trends</li>
      <li>Operational efficiency</li>
      <li>Equipment performance</li>
      <li>Lifecycle costs</li>
    </ul>

    <p className="construction-section-10-bottom-text">
      Facilitating intelligent business decisions.
    </p>

  </div>


  {/* RIGHT SIDE */}
  <div className="construction-section-10-right">

    <Link
      className="construction-section-10-signin"
      to="/user/signup"
        target="_blank"
  rel="noopener noreferrer"
    >
      Sign In Now
    </Link>

    <div className="construction-section-10-carousel">

      <h2>
        {constructionAnalyticsSlides[constructionAnalyticsSlide].title}
      </h2>

      <div className="construction-section-10-slide">

        <h3>
          {constructionAnalyticsSlides[constructionAnalyticsSlide].heading}
        </h3>

        <p>
          {constructionAnalyticsSlides[constructionAnalyticsSlide].description}
        </p>

      </div>

    </div>


    {/* CAROUSEL DOTS */}
    <div className="construction-section-10-dots">

      {constructionAnalyticsSlides.map((_, index) => (
        <button
          key={index}
          className={`construction-section-10-dot ${
            constructionAnalyticsSlide === index ? "active" : ""
          }`}
          onClick={() => setConstructionAnalyticsSlide(index)}
          aria-label={`Go to slide ${index + 1}`}
        />

      ))}

    </div>

  </div>

</section>

<section className="construction-section11">
  <div className="construction-section11-content">

    <h2>Construction Equipment Tracking with Assetpegasus</h2>

    <p>
      AssetPegasus offers a modern, scalable asset management that caters to
      the needs of Construction &amp; Real Estate businesses, helping them
      streamline operations and gain insights into their assets.
    </p>

    <p className="section11-platform-text">
      With Socialfly’s platform, businesses can:
    </p>

    <div className="section11-features">
      <div>✅ Track operational assets in real time</div>
      <div>✅ Manage maintenance schedules efficiently</div>
      <div>✅ Monitor equipment lifecycle and warranties</div>
      <div>✅ Reduce downtime and operational disruptions</div>
      <div>✅ Centralize asset information across multiple locations</div>
      <div>✅ Improve compliance and audit readiness</div>
      <div>✅ Generate detailed reports and analytics</div>
      <div>✅ Optimize operational efficiency</div>
    </div>

    <p className="section11-description">
      It enables them to streamline their facility assets, hardware, software,
      and cloud configuration into a single console for better service
      delivery and construction operation modernization.
    </p>

    <Link to="/user/singup"
      target="_blank"
  rel="noopener noreferrer"
    className="section11-btn">
      Sign In Now
    </Link>

  </div>
</section>

{/* ================= SECTION 12 ================= */}
<section className="construction-section12">
  <div className="construction-section12-content">

    <h2>
      Types of Assets in Construction &amp; Real Estate Businesses Can Be Track
    </h2>

    <p className="section12-subtitle">
      There are systems for managing assets, all of which can track:
    </p>

    <p className="section12-assets">
      Hydraulic Excavators, Bulldozers, Motor Graders, Backhoe Loaders,
      Trenchers, Tower Cranes, Telehandlers, Forklifts, Material Hoists
    </p>

    <p className="section12-assets">
      Concrete Mixers, Concrete Pump Trucks, Concrete Vibrators &amp;
      Vibratory Rollers etc.
    </p>

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
    <Link to="/education-asset-management"
      target="_blank"
  rel="noopener noreferrer"
   className="hospitality-industry-card">
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
<section className="construction-section13">
  <div className="construction-section13-top">

    <h2>Asset Management System</h2>

    <Link
      className="construction-section13-signup"
        target="_blank"
  rel="noopener noreferrer"
  to="/user/signup"
    >
      <span>Sign Up Now</span>
      <span className="section13-arrow">→</span>
    </Link>

  </div>

  {/* <div className="construction-section13-content">

    <h3>Visit</h3>

    <div className="construction-section13-links">

      <button
        onClick={() =>
          window.location.href = "/equipment-asset-management"
        }
        className="construction-section13-link"
      >
        Equipment Asset Management System
      </button>

      <button
        onClick={() =>
          window.location.href = "/it-asset-management"
        }
        className="construction-section13-link"
      >
        IT Asset Management System
      </button>

    </div>

  </div> */}
</section>

{/* ================= SECTION 14 - FAQ ================= */}

<section className="construction-section14">

  <h2>FAQ (Frequently Asked Questions)</h2>

  <div className="construction-faq">

    {/* FAQ 1 */}
    <details>
      <summary>
        What is Construction Equipment management software ?
      </summary>

      <p>
        Construction equipment management software is a centralized system
        used to track, manage, and monitor construction machinery, equipment,
        tools, and other business assets throughout their complete lifecycle.
        It helps construction and real estate businesses manage equipment
        location, utilization, maintenance, warranties, costs, assignments,
        and operational status from one platform.
      </p>
    </details>


    {/* FAQ 2 */}
    <details>
      <summary>
        Why do Construction &amp; Real Estate Businesses need asset tracking
        software ?
      </summary>

      <p>
        Construction and real estate businesses often operate equipment
        across multiple projects, sites, warehouses, and locations. Asset
        tracking software provides real-time visibility into where equipment
        is located, who is using it, its current condition, and when
        maintenance is required. This helps reduce equipment loss,
        unnecessary purchases, downtime, and operational costs.
      </p>
    </details>


    {/* FAQ 3 */}
    <details>
      <summary>
        How does asset lifecycle management help construction &amp; Real
        Estate Businesses ?
      </summary>

      <p>
        Asset lifecycle management helps businesses monitor equipment from
        purchase and deployment through assignment, maintenance, repair,
        upgrades, transfers, and retirement. By keeping a complete history of
        each asset, construction and real estate businesses can improve
        equipment utilization, schedule preventive maintenance, control
        lifecycle costs, and make better replacement and purchasing decisions.
      </p>
    </details>


    {/* FAQ 4 */}
    <details>
      <summary>
        Can asset management software track construction &amp; Real Estate
        Businesses equipment ?
      </summary>

      <p>
        Yes. Asset management software can track a wide range of construction
        and real estate equipment, including excavators, bulldozers, cranes,
        forklifts, concrete mixers, generators, loaders, drilling equipment,
        vehicles, tools, and other operational assets. Businesses can monitor
        their location, assignment, condition, maintenance schedules,
        warranties, costs, and utilization.
      </p>
    </details>


    {/* FAQ 5 */}
    <details>
      <summary>
        Is asset management software useful for multiple construction &amp;
        Real Estate Businesses locations?
      </summary>

      <p>
        Yes. A centralized asset management system is especially useful for
        businesses operating across multiple construction sites, offices,
        warehouses, and project locations. It provides a single view of assets
        across locations and makes it easier to transfer equipment, track
        assignments, monitor maintenance, and understand asset availability
        without relying on disconnected spreadsheets or manual records.
      </p>
    </details>

  </div>

</section>
        </>
    )
}

export default Construction