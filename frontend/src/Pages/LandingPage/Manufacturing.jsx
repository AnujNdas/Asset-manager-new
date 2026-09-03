import React from 'react'
import "../../Page_styles/LandingPage/Manufacturing.css"
import { useEffect , useState } from 'react';
import ProductFeatures from '../../Components/Mainpage/ProductFeature';
import { FaPlane , FaBuilding, FaHospital, FaToolbox, FaBook } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const manufacturingFaqs = [
  {
    question: "What is manufacturing asset management software?",
    answer:
      "Manufacturing asset management software is a centralized system used to track, manage and monitor factory assets such as machinery, production equipment, tools, spare parts and other operational assets throughout their lifecycle."
  },
  {
    question: "Why do factories need asset tracking software?",
    answer:
      "Factories need asset tracking software to maintain accurate visibility of equipment, locations, ownership, usage and status. It helps reduce misplaced assets, improve utilization, simplify maintenance tracking and minimize operational downtime."
  },
  {
    question: "How does asset lifecycle management help manufacturing companies?",
    answer:
      "Asset lifecycle management helps manufacturers track assets from purchase and deployment through active use, maintenance, upgrades, optimization and retirement. This provides better control over costs, maintenance schedules, asset performance and replacement decisions."
  },
  {
    question: "Can asset management software track factory equipment?",
    answer:
      "Yes. AssetPegasus can track factory equipment such as machinery, production tools, electronics, vehicles and other physical assets. Organizations can maintain information such as asset location, status, purchase details, assignment, maintenance and lifecycle history."
  },
  {
    question: "Is asset management software useful for multiple manufacturing plants?",
    answer:
      "Yes. Asset management software can provide centralized visibility across multiple manufacturing plants and locations. Managers can monitor where equipment is located, track transfers between facilities and maintain consistent asset records across the organization."
  }
];


const sectionTenCarousel = [
  {
    title: "Why Manufacturing Companies Choose AssetPegasus",
    text: "Manufacturers need a robust platform to handle a complex asset ecosystem. AssetPegasus offers an adaptive and expandable solution that allows factories to control equipment, access asset life cycle data and keep their inventory to a minimum."
  },
  {
    title: "Complete Manufacturing Asset Lifecycle Management",
    text: "AssetPegasus helps manufacturing organizations manage assets from purchase and deployment through active use, maintenance, optimization and eventual retirement, providing complete visibility throughout the asset lifecycle."
  }
];

const sectionEightImages = [
  {
    image: "/images/construction.webp",
    alt: "Asset MIS Report"
  },
  {
    image: "/images/info.webp",
    alt: "Asset Management Dashboard"
  },
  {
    image: "/images/healthcare.webp",
    alt: "Asset Inventory Report"
  }
];

const benefitsCarousel = [
  {
    title: "Optimize Equipment Utilization",
    text: "Discover idle resources and optimise value of operations.",
  },
  {
    title: "Reduce Equipment Downtime",
    text: "Use preventive maintenance scheduling to identify service requirements before equipment failures interrupt production.",
  },
  {
    title: "Improve Operational Efficiency",
    text: "Centralize asset information and eliminate manual tracking so manufacturing teams can work more efficiently.",
  },
  {
    title: "Make Better Asset Decisions",
    text: "Use accurate asset data to improve purchasing, maintenance, allocation and long-term operational planning.",
  },
];


const sectionSixCarousel = [
  {
    title: "Asset Tracking Across Multiple Locations",
    text: "Manufacturing companies that have multiple facilities and manufacturing plants need centralized asset visibility. Without an organized system, it can be difficult to manage equipment and assets across those locations. Asset tracking enables businesses to track their assets throughout different factories and maintain accurate records regarding their location, ownership and status.",
  },
  {
    title: "Manufacturing Equipment Management",
    text: "Manufacturing facilities depend on machinery, production equipment, tools, spare parts and other operational assets. AssetPegasus helps teams maintain accurate information about these resources and monitor their availability across the organization.",
  },
  {
    title: "Preventive Maintenance Management",
    text: "Keep maintenance schedules, service records, warranties and equipment information connected to each asset. Automated alerts help teams plan maintenance before equipment problems lead to costly downtime.",
  },
  {
    title: "Improve Factory Asset Utilization",
    text: "Understand where equipment is located, how it is being used and which assets are available. Better visibility helps manufacturing teams optimize asset utilization and make informed purchasing decisions.",
  },
  {
    title: "Complete Manufacturing Asset Lifecycle",
    text: "Track assets from purchase and assignment through active use, maintenance, optimization and eventual retirement or disposal, keeping the complete asset history available in one centralized system.",
  },
];

const carouselItems = [
  {
    title: "Manufacturing Asset Management for Modern Factories",
    text: "AssetPegasus allows manufacturing teams to monitor equipment, manage asset lifecycle information, automate maintenance processes, and even get real time information about assets in multiple plants. Using a modern software program tool for asset management can help factories decrease downtime, maximize asset utilization and optimize operations.",
  },
  {
    title: "Track Production Equipment Across Every Location",
    text: "Keep complete visibility of production equipment, machinery, tools and other operational assets across multiple factories and locations from one centralized platform.",
  },
  {
    title: "Maintenance & Warranty Management",
    text: "Schedule preventive maintenance, monitor warranty information and receive alerts before critical equipment requires attention, helping manufacturing teams reduce downtime and unexpected costs.",
  },
  {
    title: "Improve Asset Utilization",
    text: "Understand where assets are located, how they are being used and when they require maintenance so your organization can make better operational and purchasing decisions.",
  },
  {
    title: "Complete Asset Lifecycle Visibility",
    text: "Track manufacturing assets from purchase and assignment through active use, maintenance, optimization and eventual retirement or disposal.",
  },
];

const carouselData = [
  {
    title: "Equipment Assets Management",
    text: "Manage machinery, production equipment, tools and other physical assets from a centralized platform.",
  },
  {
    title: "Production Asset Tracking",
    text: "Monitor production equipment across locations and keep complete visibility of asset usage, ownership and status.",
  },
  {
    title: "Maintenance & Asset Monitoring",
    text: "Track maintenance activities, service schedules, warranties and operational information to reduce unexpected downtime.",
  },
];

const Manufacturing = () => {

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeSlide2, setActiveSlide2] = useState(0);
  const [activeSlide3, setActiveSlide3] = useState(0);
  const [activeSlide4, setActiveSlide4] = useState(0);
  const [activeSlide5, setActiveSlide5] = useState(0);
  const [activeBenefitSlide, setActiveBenefitSlide] = useState(0);
  // section 3 carousel 

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) =>
        current === carouselItems.length - 1
          ? 0
          : current + 1
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // section 5 carousel 

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide2((prev) => (prev + 1) % carouselData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);


  // section 6 carousel 

  useEffect(() => {
  const interval = setInterval(() => {
    setActiveSlide3((prev) =>
      prev === sectionSixCarousel.length - 1
        ? 0
        : prev + 1
    );
  }, 4500);

  return () => clearInterval(interval);
}, []);

// section 7 carousel here 

useEffect(() => {
  const interval = setInterval(() => {
    setActiveBenefitSlide(
      (current) => (current + 1) % benefitsCarousel.length
    );
  }, 4500);

  return () => clearInterval(interval);
}, []);

// section 8 carousel 
useEffect(() => {
  const interval = setInterval(() => {
    setActiveSlide4(
      (prev) => (prev + 1) % sectionEightImages.length
    );
  }, 4000);

  return () => clearInterval(interval);
}, []);

// section 9 carousel

useEffect(() => {
  const interval = setInterval(() => {
    setActiveSlide5(
      (prev) => (prev + 1) % sectionTenCarousel.length
    );
  }, 4500);

  return () => clearInterval(interval);
}, []);
  return (
    <>

     <Helmet>

        {/* Primary SEO */}
        <title>
          Manufacturing Asset Management Software | AssetPegasus
        </title>

        <meta
          name="description"
          content="Manage manufacturing assets, machinery, equipment, maintenance, lifecycle, locations, assignments."
        />

        <meta
          name="keywords"
          content="manufacturing asset management software, manufacturing asset tracking, machinery asset management."
        />

        <link
          rel="canonical"
          href="https://assetpegasus.com/manufacturing-asset-management-software"
        />


        {/* Open Graph */}
        <meta
          property="og:title"
          content="Manufacturing Asset Management Software | AssetPegasus"
        />

        <meta
          property="og:description"
          content="Track and manage manufacturing machinery, equipment and assets throughout their complete lifecycle with AssetPegasus."
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:url"
          content="https://assetpegasus.com/manufacturing-asset-management-software"
        />

        <meta
          property="og:image"
          content="https://assetpegasus.com/images/Manufacturing.webp"
        />

        <meta
          property="og:image:alt"
          content="Manufacturing Asset Management Software"
        />

        <meta
          property="og:site_name"
          content="AssetPegasus"
        />


        {/* Twitter */}
        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content="Manufacturing Asset Management Software | AssetPegasus"
        />

        <meta
          name="twitter:description"
          content="Track manufacturing machinery, equipment, maintenance and asset lifecycle management with AssetPegasus."
        />

        <meta
          name="twitter:image"
          content="https://assetpegasus.com/images/Manufacturing.webp"
        />

      </Helmet>



    {/* section 1 here  */}
    <section className="manufacturing-hero">

      {/* TOP HERO */}
      <div className="manufacturing-hero-top">

        <h1>
          Manufacturing Asset Management
          <br />
          Software for Modern Factories
        </h1>

      </div>

      {/* LOWER HERO CONTENT */}
      <div className="manufacturing-hero-bottom">

        <div className="manufacturing-breadcrumb">
          <Link to="/"
           target="_blank"
          rel="noopener noreferrer">Home</Link>
          <span> - Manufacturing Asset Management Software</span>
        </div>

        <h2>
          AssetPegasus – Simple Manufacturing Asset Management Software
          <br />
          that Scales With Your Business.
        </h2>

      </div>

    </section>

    <section className="manufacturing-section-2">

      <div className="manufacturing-section-2-content">

        <p>
          There are hundreds or thousands of assets managed by manufacturing
          companies every day. The availability of IT infrastructure, tools,
          spare parts, production equipment and machines are important to track
          efficiently, as are operational machines or their tools.
        </p>

        <p>
          In the absence of such a centralized system, factories typically
          resort to spreadsheets or manually operating them and the end result
          is an inability to see the assets, lack of timely maintenance, and
          misplacement of equipment. When an organization needs to maintain
          control over assets, monitor performance and tracks assets,
          manufacturing asset management software is the best solution.
        </p>

      </div>

      <div className="manufacturing-section-2-image">
        <img
          src="/images/construction.webp"
          alt="Manufacturing asset management dashboard"
        />
      </div>    

    </section>

    <section className="manufacturing-section-3">

      <div className="manufacturing-section-3-grid">

        {/* LEFT SIDE */}
        <div className="manufacturing-features">

          <h2>Best Features</h2>

          <ul>
            <li>
              ☁️ Cloud, Hybrid & On Premise Deployment Options.
            </li>

            <li>
              🛡️ GDPR & HIPAA Compliant.
            </li>

            <li>
              💳 No Credit Card Required. Start with 30 Days Free Trial.
            </li>

            <li>
              🎯 Track Every single Asset Across Its Full Lifecycle.
            </li>

            <li>
              🚨 Proactive Alerts for Security Risks, Expirations & Changes.
            </li>

            <li>
              🤖 Automate License Reporting and Renewals.
            </li>

            <li>
              ⏱️ Unlock Modern Inventory & with Best Visibility.
            </li>
          </ul>

          <Link
            to="/user/signup"
            className="manufacturing-trial-button"
            target="_blank"
  rel="noopener noreferrer"
          >
            Free Trial — Sign Up
          </Link>

        </div>


        {/* RIGHT SIDE */}
        <div className="manufacturing-carousel">

          <h2>
            Free Trial — 30 Days
          </h2>

          <Link
            to="/user/signup"
            target="_blank"
  rel="noopener noreferrer"
            className="manufacturing-signup-button"
          >
            Sign Up
          </Link>

          <div className="manufacturing-carousel-content">

            <div
              key={activeSlide}
              className="manufacturing-slide"
            >
              <h3>
                {carouselItems[activeSlide].title}
              </h3>

              <p>
                {carouselItems[activeSlide].text}
              </p>
            </div>

          </div>

          <div className="manufacturing-carousel-dots">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                className={
                  index === activeSlide
                    ? "active"
                    : ""
                }
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>

        </div>

      </div>

    </section>

    <section className="manufacturing-industrial-section">
      <div className="industrial-content">

        <h2>
          Industrial Asset Management for Large Manufacturing Operations
        </h2>

        <p>
          Industrial asset management is dedicated to managing complex assets
          in industrial factories and facilities. These assets can be in the
          form of heavy machinery, robotic systems, production lines, safety
          equipment or even infrastructure associated with the production
          facility.
        </p>

        <p>
          An effective industrial asset management strategy enables businesses
          to record asset performance and maximize operations across
          departments.
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

    <section className="manufacturing-section-five">

      {/* TOP CONTENT */}
      <div className="section-five-top">

        <div className="section-five-features">

          <div className="manufacturing-feature">
            <div className="feature-icon">💼</div>

            <h2>Asset Lifecycle Tracking</h2>

            <p>
              Ensure work assets are tracked from purchase through to
              retirement.
            </p>
          </div>


          <div className="manufacturing-feature">
            <div className="feature-icon">💰</div>

            <h2>Inventory and Spare Parts Management</h2>

            <p>
              Track inventory and have them automated.
            </p>
          </div>


          <div className="manufacturing-feature">
            <div className="feature-icon">🗓️</div>

            <h2>Multi-Plant Asset Visibility</h2>

            <p>
              Have an ability to oversee assets in several manufacturing
              plants.
            </p>
          </div>

        </div>


        <div className="section-five-description">

          <p>
            Managers can assign equipment to different departments, monitor
            transfers of the factory assets across plants and guarantee that
            the production team always gets the resource it requires with
            factory asset tracking.
          </p>

        </div>

      </div>


      {/* BOTTOM CAROUSEL */}
      <div className="section-five-carousel">

 <div className="carousel-content">

  <h2>
    {carouselData[activeSlide2].title}
  </h2>

  <p>
    {carouselData[activeSlide2].text}
  </p>

</div>


        <div className="carousel-dots">

  {carouselData.map((_, index) => (

  <button
    key={index}
    className={`carousel-dot ${
      activeSlide2 === index ? "active" : ""
    }`}
    onClick={() => setActiveSlide2(index)}
    aria-label={`Show slide ${index + 1}`}
  />

))}

        </div>

      </div>

    </section>

    <section className="manufacturing-section-six">

  {/* LEFT SIDE - FIXED CONTENT */}
  <div className="section-six-features">

    <h2>
      Key Features of Socialfly for Manufacturing Asset Management
    </h2>

    <div className="section-six-feature">

      <h3>
        <span>•</span> Real-Time Asset Tracking
      </h3>

      <p>
        Track the condition, location and status of equipment
        in real time.
      </p>

    </div>

    <div className="section-six-feature">

      <h3>
        <span>•</span> QR Code Tracking
      </h3>

      <p>
        Instantly scan assets while using mobile devices to
        update asset data.
      </p>

    </div>

    <div className="section-six-feature">

      <h3>
        <span>•</span> Preventive Maintenance Scheduling
      </h3>

      <p>
        Programmed alerts for maintenance to minimise
        equipment downtime.
      </p>

    </div>

  </div>


  {/* RIGHT SIDE - CAROUSEL */}
  <div className="section-six-carousel">

    <div
      key={activeSlide3}
      className="section-six-slide"
    >

      <h2>
        {sectionSixCarousel[activeSlide3].title}
      </h2>

      <p>
        {sectionSixCarousel[activeSlide3].text}
      </p>

    </div>


    {/* DOTS */}
    <div className="section-six-dots">

      {sectionSixCarousel.map((_, index) => (

        <button
          key={index}
          type="button"
          aria-label={`Show slide ${index + 1}`}
          className={
            index === activeSlide3
              ? "active"
              : ""
          }
          onClick={() => setActiveSlide3(index)}
        />

      ))}

    </div>


    {/* SIGN UP */}
    <Link
      to="/user/signup"
      target="_blank"
  rel="noopener noreferrer"
      className="section-six-signup"
    >
      Sign Up Now
    </Link>

  </div>

    </section>

    <section className="manufacturing-section-seven">

  <div className="section-seven-content">

    <h2 className="section-seven-heading">
      Benefits of Manufacturing Asset Management Software
    </h2>

    <div className="section-seven-carousel">

      <div
        key={activeBenefitSlide}
        className="section-seven-slide"
      >

        <h3>
          {benefitsCarousel[activeBenefitSlide].title}
        </h3>

        <p>
          {benefitsCarousel[activeBenefitSlide].text}
        </p>

      </div>

    </div>

    <div className="section-seven-dots">

      {benefitsCarousel.map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Show benefit ${index + 1}`}
          className={
            index === activeBenefitSlide
              ? "active"
              : ""
          }
          onClick={() => setActiveBenefitSlide(index)}
        />
      ))}

    </div>

    <Link
      to="/user/signup"
      target="_blank"
  rel="noopener noreferrer"
      className="section-seven-signin"
    >
      Sign Up Now
    </Link>

  </div>

</section>

<section className="manufacturing-section-eight">

  <div className="section-eight-grid">

    {/* =========================
        LEFT FEATURES
    ========================= */}

    <div className="section-eight-features">

      <div className="section-eight-feature">

        <div className="section-eight-icon">
          ✅
        </div>

        <h3>
          Easiest User experience
        </h3>

        <p>
          Capture all types of assets details with easiest way.
        </p>

      </div>


      <div className="section-eight-feature">

        <div className="section-eight-icon">
          🛡️
        </div>

        <h3>
          Security & Risk Management
        </h3>

        <p>
          Identify outdated software or unauthorized devices
          to fortify your organization’s security posture.
        </p>

      </div>


      <div className="section-eight-feature">

        <div className="section-eight-icon">
          📊
        </div>

        <h3>
          Drive Operational Efficiency
        </h3>

        <p>
          Eliminate manual tracking and human errors & improve
          asset allocation and internal workflows.
        </p>

      </div>

    </div>


    {/* =========================
        RIGHT IMAGE CAROUSEL
    ========================= */}

    <div className="section-eight-carousel">

      <div className="section-eight-image-wrapper">

        <img
          key={activeSlide4}
          src={sectionEightImages[activeSlide4].image}
          alt={sectionEightImages[activeSlide4].alt}
          className="section-eight-image"
        />

      </div>


      {/* DOTS */}

      <div className="section-eight-dots">

        {sectionEightImages.map((_, index) => (

          <button
            key={index}
            type="button"
            aria-label={`Show image ${index + 1}`}
            className={
              index === activeSlide4
                ? "active"
                : ""
            }
            onClick={() => setActiveSlide4(index)}
          />

        ))}

      </div>

    </div>

  </div>

</section>

        {/* SECTION 9 */}
<section className="manufacturing-section-nine">

  <div className="section-nine-stats">

    <div className="section-nine-stat">
      <h2>500+</h2>
      <p>
        Companies Trust Our
        <br />
        Solution
      </p>
    </div>

    <div className="section-nine-stat">
      <h2>95%</h2>
      <p>
        Uptime Guarantee
      </p>
    </div>

    <div className="section-nine-stat">
      <h2>100%</h2>
      <p>
        Automated Workflow
      </p>
    </div>

    <div className="section-nine-stat">
      <h2>100%</h2>
      <p>
        GDPR &amp; HIPAA
        <br />
        Compliant
      </p>
    </div>

  </div>

</section>

{/* =========================================
    SECTION 10
========================================= */}

<section className="manufacturing-section-ten">

  <div className="section-ten-grid">

    {/* =========================
        LEFT SIDE
    ========================= */}

    <div className="section-ten-lifecycle">

      <h2>
        Best Manufacturing Asset
        <br />
        Management Software
      </h2>

      <p className="section-ten-complete">
        Complete lifecycle
      </p>

      <div className="section-ten-stage">
        Stage 1: <strong>Purchase</strong>
      </div>

      <div className="section-ten-stage">
        Stage 2: <strong>Deployment & Configuration</strong>
      </div>

      <div className="section-ten-stage">
        Stage 3: <strong>Active Use & Monitoring</strong>
      </div>

      <div className="section-ten-stage">
        Stage 4: <strong>Maintenance & Support</strong>
      </div>

      <div className="section-ten-stage">
        Stage 5: <strong>Optimization & License Management</strong>
      </div>

    </div>


    {/* =========================
        RIGHT SIDE
    ========================= */}

    <div className="section-ten-carousel">

      <Link
        to="/user/signup"
        target="_blank"
  rel="noopener noreferrer"
        className="section-ten-signin"
      >
        Sign In Now
      </Link>


      <div
        className="section-ten-slide"
        key={activeSlide5}
      >

        <h3>
          {sectionTenCarousel[activeSlide5].title}
        </h3>

        <p>
          {sectionTenCarousel[activeSlide5].text}
        </p>

      </div>


      {/* DOTS */}

      <div className="section-ten-dots">

        {sectionTenCarousel.map((_, index) => (

          <button
            key={index}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            className={
              index === activeSlide5
                ? "active"
                : ""
            }
            onClick={() => setActiveSlide5(index)}
          />

        ))}

      </div>

    </div>

  </div>

</section>

<section className="manufacturing-section-11">
  <h2>Manage Assets Across Industries</h2>

  <div className="manufacturing-industry-grid">

    <div
  className="manufacturing-industry-card"
  onClick={() =>
    window.open(
      "/travel-transportation-asset-management",
      "_blank",
      "noopener,noreferrer"
    )
  }
>
  <div className="industry-icon">✈</div>
  <h3>Travel & Transportation Logistics</h3>
</div>


<div
  className="manufacturing-industry-card"
  onClick={() =>
    window.open(
      "/restaurant-hospitality-asset-management",
      "_blank",
      "noopener,noreferrer"
    )
  }
>
  <div className="industry-icon">
    <FaBuilding />
  </div>

  <h3>Restaurant & Hospitality</h3>
</div>


<div
  className="manufacturing-industry-card"
  onClick={() =>
    window.open(
      "/healthcare-asset-tracking",
      "_blank",
      "noopener,noreferrer"
    )
  }
>
  <div className="industry-icon">
    <FaHospital />
  </div>

  <h3>Healthcare Asset Tracking</h3>
</div>


<div
  className="manufacturing-industry-card"
  onClick={() =>
    window.open(
      "/construction-equipment-tracking",
      "_blank",
      "noopener,noreferrer"
    )
  }
>
  <div className="industry-icon">
    <FaToolbox />
  </div>

  <h3>Construction Equipment Tracking</h3>
</div>

<div
  className="manufacturing-industry-card"
  onClick={() =>
    window.open(
      "/education-asset-management",
      "_blank",
      "noopener,noreferrer"
    )
  }
>
  <div className="industry-icon">
    <FaBook />
  </div>

  <h3>
    Education Asset Management
  </h3>
</div>

  </div>
</section>

{/* SECTION 12 */}
<section className="manufacturing-section-12">

  <div className="manufacturing-section-12-content">

    <h2>Why Businesses Choose AssetPegasus</h2>

    <h3>8+ Years of Building Digital Success Stories.</h3>

    <p className="section-12-intro">
      Small, Medium &amp; Big Organizations require a simple flexible and
      scalable asset management platform which capable of managing
      complex asset environments.
    </p>

    <p className="section-12-description">
      <Link to="/it-asset-management"   target="_blank"
  rel="noopener noreferrer">HAM &amp; ITAM</Link> we bring all that expertise into
      a single SaaS (Software as Service) platform that helps to Manage
      Businesses &amp; Individuals.
    </p>

    <Link
      to="/about"
        target="_blank"
  rel="noopener noreferrer"
      className="section-12-button"
    >
      About Us
    </Link>

  </div>

</section>

<ProductFeatures /> 

{/* SECTION 13 */}
<section className="manufacturing-section-13">

  <div className="section-13-header">

    <h2>
      AssetPegasus – Asset Management System
    </h2>

    <Link to="/user/signup"   target="_blank"
  rel="noopener noreferrer" className="section-13-signup">
      Sign Up Now <span>→</span>
    </Link>

  </div>

  {/* <div className="section-13-visit">
    <span>Visit</span>
  </div>

  <div className="section-13-options">

    <a
      href="/machinery-management-software"
      className="section-13-option"
    >
      Machinery Asset Management System
    </a>

    <a
      href="/it-asset-management"
      className="section-13-option"
    >
      IT Asset Management Software
    </a>

  </div> */}

</section>

{/* section 14 */}

<section className="manufacturing-faq-section">
  <h2>FAQ (Frequently Asked Questions)</h2>

  <div className="manufacturing-faq-list">
    {manufacturingFaqs.map((faq, index) => (
      <details key={index} className="manufacturing-faq-item">
        <summary>{faq.question}</summary>
        <p>{faq.answer}</p>
      </details>
    ))}
  </div>
</section>
    </>
  )
}

export default Manufacturing