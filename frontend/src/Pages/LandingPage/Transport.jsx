import React from 'react'
import "../../Page_styles/LandingPage/Transport.css"
import { useState , useEffect } from 'react';
import ProductFeatures from '../../Components/Mainpage/ProductFeature';
import { FaBuilding, FaChrome, FaBook ,  FaHospital, FaToolbox } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
const travelFaqs = [
  {
    question: "What is Travel & Transportation asset management software?",
    answer:
      "Travel & Transportation asset management software is a centralized system used to track, monitor, maintain, and manage vehicles, transportation equipment, logistics assets, and operational resources throughout their complete lifecycle. It helps businesses maintain better visibility over assets, reduce downtime, control costs, and improve operational efficiency.",
  },
  {
    question: "Why do Travel & Transportation need asset tracking software?",
    answer:
      "Travel and transportation businesses manage large numbers of vehicles, cargo equipment, containers, warehouse assets, and other operational resources. Asset tracking software provides real-time visibility into asset location, status, utilization, maintenance, and ownership, helping reduce asset loss, delays, downtime, and unnecessary operational expenses.",
  },
  {
    question:
      "How does asset lifecycle management help Travel & Transportation companies?",
    answer:
      "Asset lifecycle management helps transportation companies monitor assets from purchase and deployment through active use, maintenance, upgrades, and retirement. It helps organizations schedule preventive maintenance, track operating costs, monitor asset performance, and make better replacement or investment decisions.",
  },
  {
    question:
      "Can asset management software track Travel & Transportation equipment?",
    answer:
      "Yes. Asset management software can track many types of transportation and logistics assets, including trucks, trailers, buses, delivery vehicles, cargo containers, warehouse equipment, aircraft-related assets, rail equipment, and other operational resources. Businesses can monitor their condition, location, status, maintenance, and lifecycle information from a centralized system.",
  },
  {
    question:
      "Is asset management software useful for multiple Travel & Transportation Branch?",
    answer:
      "Yes. Asset management software is particularly useful for organizations operating across multiple branches, depots, warehouses, terminals, offices, or transportation locations. It provides centralized visibility across locations while allowing businesses to track asset transfers, assignments, maintenance activities, and operational information for each branch.",
  },
];

const section10Carousel = [
  {
    title: "Travel & Transportation Logistics Management with Socialfly",
    content:
      "Socialfly offers a web based, unified, and scalable asset management system to help transportation providers, logistics firms, fleet operators and travel companies manage their assets with greater efficiency.",
  },
  {
    title: "Smarter Fleet & Asset Management",
    content:
      "Track vehicles, containers, equipment and operational assets in real time while improving visibility across your transportation and logistics operations.",
  },
  {
    title: "Maintenance & Lifecycle Management",
    content:
      "Manage maintenance schedules, warranties, inspections and complete asset lifecycles to reduce downtime and keep transportation operations running efficiently.",
  },
];
const section8CarouselData = [
  {
    id: 1,
    title: "Easiest User experience",
    icon: "✅",
    description:
      "Capture all types of assets details with easiest way.",
    image: "/images/info.webp",
  },
  {
    id: 2,
    title: "Security & Risk Management",
    icon: "🛡️",
    description:
      "Identify outdated software or unauthorized devices to fortify your organization’s security posture.",
    image: "/images/construction.webp",
  },
  {
    id: 3,
    title: "Drive Operational Efficiency",
    icon: "📊",
    description:
      "Eliminate manual tracking and human errors & improve asset allocation and internal workflows.",
    image: "/images/healthcare.webp",
  },
];


const section7CarouselData = [
  {
    id: 1,
    title: "Travel and Transportation Logistics Management Systems",
    content: (
      <>
        <div>✅ Trucks and trailers</div>
        <div>✅ Delivery vehicles</div>
        <div>✅ Buses and other public transit vehicles</div>
        <div>✅ Cargo containers</div>
        <div>✅ Warehouse equipment</div>
      </>
    ),
  },

  {
    id: 2,
    title: "Fleet & Vehicle Assets",
    content: (
      <>
        <div>✅ Freight trucks</div>
        <div>✅ Transport vans</div>
        <div>✅ Passenger vehicles</div>
        <div>✅ Taxis and rental vehicles</div>
        <div>✅ Specialized transport vehicles</div>
      </>
    ),
  },

  {
    id: 3,
    title: "Cargo & Logistics Assets",
    content: (
      <>
        <div>✅ Shipping containers</div>
        <div>✅ Cargo handling equipment</div>
        <div>✅ Loading and unloading equipment</div>
        <div>✅ Warehouse machinery</div>
        <div>✅ Distribution equipment</div>
      </>
    ),
  },

  {
    id: 4,
    title: "Transportation Infrastructure Assets",
    content: (
      <>
        <div>✅ Depots and terminals</div>
        <div>✅ Parking and storage facilities</div>
        <div>✅ Maintenance facilities</div>
        <div>✅ Fueling equipment</div>
        <div>✅ Communication and tracking systems</div>
      </>
    ),
  },
];


const carouselData = [
  {
    id: 1,
    title: "Fleet Performance Analytics",
    content: (
      <>
        <div>✅ Fleet utilization</div>
        <div>✅ Idle time</div>
        <div>✅ Delivery performance</div>
        <div>✅ Maintenance costs</div>
        <div>✅ Operational efficiency</div>
        <div>✅ Asset lifecycle performance</div>

        <p>
          These findings support companies to make sensible
          operational and financial choices.
        </p>
      </>
    ),
  },

  {
    id: 2,
    title: "Smart Transportation Management",
    content: (
      <>
        <div>✅ Vehicle utilization</div>
        <div>✅ Route efficiency</div>
        <div>✅ Fuel monitoring</div>
        <div>✅ Asset availability</div>
        <div>✅ Maintenance scheduling</div>

        <p>
          Improve transportation efficiency with centralized
          asset tracking and monitoring.
        </p>
      </>
    ),
  },

  {
    id: 3,
    title: "Real-Time Asset Visibility",
    content: (
      <>
        <div>✅ Multi-location tracking</div>
        <div>✅ Real-time asset status</div>
        <div>✅ Maintenance alerts</div>
        <div>✅ Asset history</div>
        <div>✅ Detailed reporting</div>

        <p>
          Gain complete visibility into transportation assets
          across locations and operations.
        </p>
      </>
    ),
  },
];




const travelSection4Slides = [
  {
    id: 1,
    title: "What Is Travel & Transportation Asset Management?",
    content:
      "Travel and transportation asset management is the process of monitoring, maintaining, and optimizing the operational assets used across transportation networks. These technologies include sensors, QR codes, barcode scanning, RFID, dashboards, and mobile applications that work together to provide a unified operational environment.",
  },
  {
    id: 2,
    title: "Improve Fleet Visibility",
    content:
      "Transportation businesses can monitor vehicles, containers, freight equipment, and other operational assets from a centralized platform. Real-time visibility helps teams know where assets are located, how they are being used, and whether they are available, active, or under maintenance.",
  },
  {
    id: 3,
    title: "Reduce Transportation Downtime",
    content:
      "Automated maintenance schedules, service reminders, inspections, and warranty tracking help reduce unexpected equipment failures. Businesses can identify upcoming maintenance requirements early and keep vehicles and transportation equipment operational.",
  },
  {
    id: 4,
    title: "Optimize Transportation Operations",
    content:
      "Centralized asset information helps transportation companies improve fleet utilization, reduce unnecessary operating costs, coordinate equipment efficiently, and make better decisions using real-time operational information.",
  },
  {
    id: 5,
    title: "Track Assets Across Multiple Locations",
    content:
      "AssetPegasus provides centralized visibility across warehouses, terminals, yards, offices, and transportation routes. Teams can manage assets across multiple locations while maintaining accurate records of maintenance, assignments, costs, and lifecycle information.",
  },
];
const Transport = () => {
    const [travelSection4Index, setTravelSection4Index] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [section7CurrentSlide, setSection7CurrentSlide] = useState(0);
    const [section8CurrentSlide, setSection8CurrentSlide] = useState(0);
    const [activeSlide10, setActiveSlide10] = useState(0);
     const [openIndex, setOpenIndex] = useState(null);



    // section 4 carousel 
    useEffect(() => {
  const interval = setInterval(() => {
    setTravelSection4Index((prev) =>
      (prev + 1) % travelSection4Slides.length
    );
  }, 5000);

  return () => clearInterval(interval);
}, [travelSection4Slides.length]);

// section 6 carousel 
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) =>
      (prev + 1) % carouselData.length
    );
  }, 4000);

  return () => clearInterval(interval);
}, []);

// section 7 carousel 
useEffect(() => {
  const interval = setInterval(() => {
    setSection7CurrentSlide(
      (prev) => (prev + 1) % section7CarouselData.length
    );
  }, 4000);

  return () => clearInterval(interval);
}, []);

// section 8 carousel 
useEffect(() => {
  const interval = setInterval(() => {
    setSection8CurrentSlide(
      (prev) => (prev + 1) % section8CarouselData.length
    );
  }, 4000);

  return () => clearInterval(interval);
}, []);

// section 10 carousel 
useEffect(() => {
  const interval = setInterval(() => {
    setActiveSlide10((prev) =>
      (prev + 1) % section10Carousel.length
    );
  }, 5000);

  return () => clearInterval(interval);
}, []);

// section 14 handle function 

 const handleToggle = (index) => {
    setOpenIndex((prevIndex) =>
      prevIndex === index ? null : index
    );
  };
  return (
    <>
    <Helmet>

        {/* =========================
            BASIC SEO
        ========================= */}

        <title>
          Travel & Transportation Asset Management Software | AssetPegasus
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
          href="https://assetpegasus.com/travel-transportation-asset-management"
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
          content="Travel & Transportation Asset Management Software | AssetPegasus"
        />

        <meta
          property="og:description"
          content="Track and manage transportation assets, vehicles, equipment, maintenance, locations, costs and complete asset lifecycles with AssetPegasus."
        />

        <meta
          property="og:url"
          content="https://assetpegasus.com/travel-transportation-asset-management"
        />

        <meta
          property="og:site_name"
          content="AssetPegasus"
        />

        <meta
          property="og:image"
          content="https://assetpegasus.com/images/Transportpage.webp"
        />

        <meta
          property="og:image:alt"
          content="Travel and Transportation Asset Management Software"
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
          content="Travel & Transportation Asset Management Software | AssetPegasus"
        />

        <meta
          name="twitter:description"
          content="Manage and track transportation assets, vehicles, equipment, maintenance, locations, costs and complete asset lifecycles with AssetPegasus."
        />

        <meta
          name="twitter:url"
          content="https://assetpegasus.com/travel-transportation-asset-management"
        />

        <meta
          name="twitter:image"
          content="https://assetpegasus.com/images/Transportpage.webp"
        />

        <meta
          name="twitter:image:alt"
          content="Travel and Transportation Asset Management Software"
        />

      </Helmet>


        <section className="travel-section1">
  <div className="travel-section1-content">
    <h1>
      Travel &amp; Transportation Logistics Asset
      <br />
      Management
    </h1>
  </div>

  <div className="travel-section1-breadcrumb">
    <Link to="/" 
    target="_blank"
  rel="noopener noreferrer"
  >Home</Link>
    <span> - </span>
    <span>Travel &amp; Transportation Asset Management Software</span>
  </div>
</section>

<section className="travel-section2">
  <div className="travel-section2-container">

    <h2>
      AssetPegasus — <strong>Simple Travel &amp; Transportation Asset Management</strong>{" "}
      Software
      <br />
      <strong>that Scales With Your Business.</strong>
    </h2>

    <div className="travel-section2-content">

      <p>
        Travel and transportation relies on a fast-paced business where
        efficiency, visibility and coordination in real time are essential.
        Over thousands of assets are being moved daily by logistics providers,
        fleet operators, cargo companies, public transport, travel providers
        and distribution systems. These include vehicles; goods containers;
        weather or other sensors, as well as warehouse equipment, operative
        tools, IT systems and maintenance systems.
      </p>

      <p>
        Having no centralised system for asset management can result in late
        delivery, limited fleet transparency, downtime, increased fuel
        expenses, loss of equipment, and sub-optimal maintenance practices.
        Today’s logistics management software for travel and transportation
        can help businesses optimize their operations, use effectively the
        transportation fleet, increase tracking precision and complete
        visibility through the supply chain.
      </p>

    </div>

  </div>
</section>

{/* ================= SECTION 3 ================= */}

<section className="travel-section3">

  <div className="travel-dashboard-wrapper">
    <img
      src="/images/Transportpage.webp"
      alt="Travel and Transportation Asset Management Dashboard"
      className="travel-dashboard-image"
    />
  </div>

</section>

{/* ================= SECTION 4 ================= */}

<section className="travel-section4">

  {/* LEFT - FIXED FEATURES */}
  <div className="travel-section4-features">

    <h2>Best Features</h2>

    <div className="travel-feature-item">
      <span>☁️</span>
      <p>Cloud, Hybrid &amp; On Premise Deployment Options.</p>
    </div>

    <div className="travel-feature-item">
      <span>🛡️</span>
      <p>GDPR &amp; HIPAA Compliant.</p>
    </div>

    <div className="travel-feature-item">
      <span>💳</span>
      <p>No Credit Card Required. Start with 30 Days Free Trial.</p>
    </div>

    <div className="travel-feature-item">
      <span>🎯</span>
      <p>Track Every single Asset Across Its Full Lifecycle.</p>
    </div>

    <div className="travel-feature-item">
      <span>🚨</span>
      <p>Proactive Alerts for Security Risks, Expirations &amp; Changes.</p>
    </div>

    <div className="travel-feature-item">
      <span>🤖</span>
      <p>Automate License Reporting and Renewals.</p>
    </div>

    <div className="travel-feature-item">
      <span>⏱️</span>
      <p>Unlock Modern Inventory &amp; with Best Visibility.</p>
    </div>

    <Link to="/user/signup"
    target="_blank"
  rel="noopener noreferrer"
   className="travel-free-trial-btn">
      Free Trial — No Card Required
    </Link>

  </div>


  {/* RIGHT - AUTOMATIC CAROUSEL */}
  <div className="travel-section4-carousel">

    <div className="travel-carousel-top">

      <h2>Free Trial — 30 Days</h2>

      <Link to="/user/signup"
      target="_blank"
  rel="noopener noreferrer"
   className="travel-signup-btn">
        Sign Up
      </Link>

    </div>


    <div className="travel-carousel-window">

      <div
        className="travel-carousel-track"
        style={{
          transform: `translateX(-${travelSection4Index * 100}%)`,
        }}
      >

        {travelSection4Slides.map((slide) => (

          <div
            className="travel-carousel-slide"
            key={slide.id}
          >

            <h2>{slide.title}</h2>

            <p>{slide.content}</p>

          </div>

        ))}

      </div>

    </div>


    {/* DOTS */}

    <div className="travel-carousel-dots">

      {travelSection4Slides.map((_, index) => (

        <button
          key={index}
          className={`travel-carousel-dot ${
            travelSection4Index === index
              ? "active"
              : ""
          }`}
          onClick={() => setTravelSection4Index(index)}
          aria-label={`Go to slide ${index + 1}`}
        />

      ))}

    </div>

  </div>

</section>

{/* ================= SECTION 5 ================= */}

<section className="travel-section5">

  {/* TOP CONTENT */}

  <div className="travel-section5-intro">

    <h2>
      Asset Management for Travel &amp; Transportation Operations
    </h2>

    <p>
      Route optimization software assists transportation companies to
      decrease fuel costs, enhance the speed of deliveries, increase
      fleet productivity and maximize operational efficiency. Intelligent
      tracking systems and analysis offer business actionable intelligence
      for optimizing performance, and reducing transportation costs.
    </p>

    <p>
      Cargo visibility and security also are enhanced in asset management
      systems. Companies can track shipments as they travel, minimize
      asset loss, enhance visibility and accountability and keep
      chain-of-custody well documented throughout the shipment.
    </p>

  </div>


  {/* BENEFITS */}

  <div className="travel-section5-benefits">

    {/* ITEM 1 */}

    <div className="travel-section5-item">

      <div className="travel-section5-icon">
        💼
      </div>

      <h3>
        Asset Lifecycle Tracking
      </h3>

      <p>
        Ensure work assets are tracked from purchase through to retirement.
      </p>

    </div>


    {/* ITEM 2 */}

    <div className="travel-section5-item">

      <div className="travel-section5-icon">
        💰
      </div>

      <h3>
        Inventory and Spare Parts Management
      </h3>

      <p>
        Track inventory and have them automated
      </p>

    </div>


    {/* ITEM 3 */}

    <div className="travel-section5-item">

      <div className="travel-section5-icon">
        📅
      </div>

      <h3>
        Multi Location Asset Visibility
      </h3>

      <p>
        Have an ability to oversee assets in several transportation
        facilities and locations.
      </p>

    </div>

  </div>

</section>

<section className="travel-section6">

  <h2 className="travel-section6-title">
    Travel &amp; Transportation Asset Management Software for Modern Factories
  </h2>

  <div className="travel-section6-content">

    {/* LEFT SIDE */}
    <div className="travel-section6-left">

      <h3>Key Features</h3>

      <ul>

        <li>
          <strong>Real Time Asset Tracking</strong>
          <p>
            Track the condition, location and status of equipment
            real time.
          </p>
        </li>

        <li>
          <strong>QR Code Tracking</strong>
          <p>
            Instantly scan assets while using mobile devices to
            update asset data.
          </p>
        </li>

        <li>
          <strong>Preventive Maintenance Scheduling</strong>
          <p>
            Programmed alerts for maintenance to minimise
            equipment downtime.
          </p>
        </li>

      </ul>

    </div>


    {/* RIGHT CAROUSEL */}
    <div className="travel-section6-right">

      <div className="travel-section6-slide">

        <h3>
          {carouselData[currentSlide].title}
        </h3>

        <div className="travel-check-list">
          {carouselData[currentSlide].content}
        </div>

      </div>


      {/* DOTS */}
      <div className="travel-section6-dots">

        {carouselData.map((item, index) => (
          <span
            key={item.id}
            className={
              index === currentSlide
                ? "travel-section6-dot active"
                : "travel-section6-dot"
            }
            onClick={() => setCurrentSlide(index)}
          />
        ))}

      </div>


      <Link
        className="travel-section6-button" to="/user/signup"
        target="_blank"
  rel="noopener noreferrer"
      >
        Sign Up Now
      </Link>

    </div>

  </div>

</section>

<section className="travel-section7">

  <h2 className="travel-section7-title">
    Types of Travel &amp; Transportation Assets That Can Be Managed
  </h2>

  <div className="travel-section7-carousel">

    <h3>
      {section7CarouselData[section7CurrentSlide].title}
    </h3>

    <p className="travel-section7-intro">
      Travel and transportation logistics management systems
      can monitor and control many types of operation assets
      such as:
    </p>

    <div className="travel-section7-list">
      {section7CarouselData[section7CurrentSlide].content}
    </div>

  </div>


  {/* DOTS */}

  <div className="travel-section7-dots">

    {section7CarouselData.map((item, index) => (
      <span
        key={item.id}
        className={
          index === section7CurrentSlide
            ? "travel-section7-dot active"
            : "travel-section7-dot"
        }
        onClick={() => setSection7CurrentSlide(index)}
      />
    ))}

  </div>


  {/* BUTTON */}

  <Link
    className="travel-section7-button"
    to="/user/signup"
    target="_blank"
  rel="noopener noreferrer"
  >
    Free Trial – No Card Required
  </Link>

</section>

<section className="travel-section8">

  <div className="travel-section8-content">

    {/* LEFT SIDE */}
    <div className="travel-section8-left">

      <div className="travel-section8-feature">

        <span className="travel-section8-icon">
          {section8CarouselData[section8CurrentSlide].icon}
        </span>

        <h3>
          {section8CarouselData[section8CurrentSlide].title}
        </h3>

        <p>
          {section8CarouselData[section8CurrentSlide].description}
        </p>

      </div>

    </div>


    {/* RIGHT SIDE IMAGE */}
    <div className="travel-section8-right">

      <div className="travel-section8-image-wrapper">

        <img
          key={section8CarouselData[section8CurrentSlide].id}
          src={section8CarouselData[section8CurrentSlide].image}
          alt={section8CarouselData[section8CurrentSlide].title}
          className="travel-section8-image"
        />

      </div>

    </div>

  </div>


  {/* DOTS */}
  <div className="travel-section8-dots">

    {section8CarouselData.map((item, index) => (
      <span
        key={item.id}
        className={
          index === section8CurrentSlide
            ? "travel-section8-dot active"
            : "travel-section8-dot"
        }
        onClick={() => setSection8CurrentSlide(index)}
      />
    ))}

  </div>

</section>

<section className="travel-section9">

  <div className="travel-section9-stats">

    <div className="travel-section9-stat">
      <h2>500+</h2>
      <p>
        Companies Trust Our
        <br />
        Solution
      </p>
    </div>

    <div className="travel-section9-stat">
      <h2>95%</h2>
      <p>Uptime Guarantee</p>
    </div>

    <div className="travel-section9-stat">
      <h2>100%</h2>
      <p>Automated Workflow</p>
    </div>

    <div className="travel-section9-stat">
      <h2>100%</h2>
      <p>
        GDPR &amp; HIPAA
        <br />
        Compliant
      </p>
    </div>

  </div>

</section>

<section className="travel-section10">

  {/* LEFT SIDE */}
  <div className="travel-section10-left">

    <h2>
      Best Travel & Transportation Asset Management Software
    </h2>

    <h3>Complete lifecycle</h3>

    <div className="travel-section10-stages">

      <p>
        Stage 1: <strong>Purchase</strong>
      </p>

      <p>
        Stage 2: <strong>Deployment & Configuration</strong>
      </p>

      <p>
        Stage 3: <strong>Active Use & Monitoring</strong>
      </p>

      <p>
        Stage 4: <strong>Maintenance & Support</strong>
      </p>

      <p>
        Stage 5: <strong>Optimization & License Management</strong>
      </p>

    </div>

  </div>


  {/* RIGHT SIDE CAROUSEL */}
  <div className="travel-section10-right">

    <Link className="travel-section10-trial" to="/user/signup"
    target="_blank"
  rel="noopener noreferrer">
      Free Trial
    </Link>

    <div className="travel-section10-carousel">

      <h2>
        {section10Carousel[activeSlide10].title}
      </h2>

      <p>
        {section10Carousel[activeSlide10].content}
      </p>

    </div>


    {/* DOTS */}
    <div className="travel-section10-dots">

      {section10Carousel.map((_, index) => (
        <span
          key={index}
          className={
            index === activeSlide10
              ? "travel-section10-dot active"
              : "travel-section10-dot"
          }
        />
      ))}

    </div>

  </div>

</section>

<section className="travel-section11">

  {/* TOP CONTENT */}
  <div className="travel-section11-future">

    <h2>
      The Future of Travel & Transportation Logistics
    </h2>

    <p>
      The transportation and logistics industry is rapidly evolving with
      technologies such as AI-powered analytics, IoT-enabled tracking,
      predictive maintenance systems, cloud-based logistics infrastructure,
      and real-time operational dashboards.
    </p>

    <p>
      In this era of business intelligence, ITMS systems are more widely
      adopted than ever, with a particular emphasis on providing better
      tracking and accuracy in deliveries, minimizing risks in a business
      model, optimizing the utilization of fleets, and keeping customers
      from becoming dissatisfied with their business in a very competitive
      market. The continued growth of logistics supply chains worldwide
      will be heavily reliant on asset management software to be able to
      make them more efficient, transparent and scalable in transportation.
    </p>

  </div>


  {/* WHY SOCIALFLY */}
  <div className="travel-section11-socialfly">

    <h2>
      Why Businesses Choose Socialfly
    </h2>

    <h3>
      8+ Years of Building Digital Success Stories.
    </h3>

    <p>
      Small, Medium & Big Organizations require a simple flexible and
      scalable asset management platform which capable of managing
      complex asset environments.
    </p>

    <p>
      <a href="/ham-management">HAM & ITAM</a> we bring all that expertise
      into a single SaaS (Software as Service) platform that helps to
      Manage Businesses & Individuals.
    </p>

    <Link
      className="travel-section11-about-btn"
      target="_blank"
  rel="noopener noreferrer"
      to="/about"
    >
      About Us
    </Link>

  </div>

</section>

<ProductFeatures /> 

<section className="hospitality-section-14">

  <div className="hospitality-industry-cards">

    {/* CARD 1 */}
    <Link to="/education-asset-management" className="hospitality-industry-card"
    target="_blank"
  rel="noopener noreferrer"
    >
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


    {/* CARD 2 */}
    <Link to="/healthcare-asset-tracking" className="hospitality-industry-card industry-card-raised"
    target="_blank"
  rel="noopener noreferrer"
    >
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
    <Link to="/construction-equipment-tracking" className="hospitality-industry-card"
    target="_blank"
  rel="noopener noreferrer"
    >
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
    <Link to="/restaurant-hospitality-asset-management" className="hospitality-industry-card industry-card-raised"
    target="_blank"
  rel="noopener noreferrer"
    >
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
    <Link to="/manufacturing-asset-management-software" className="hospitality-industry-card"
    target="_blank"
  rel="noopener noreferrer"
    >
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

<section className="travel-section12">

  <div className="travel-section12-header">
    <h2>Asset Management System</h2>

    <Link
      className="travel-section12-signup"
      to = "/user/signup"
      target="_blank"
  rel="noopener noreferrer"
    >
      Sign Up Now <span>→</span>
    </Link>
  </div>

  {/* <h3>Visit</h3>

  <div className="travel-section12-links">

    <button
      onClick={() => window.location.href = "/construction-equipment-tracking"}
    >
      Equipment Asset Management System
    </button>

    <button
      onClick={() => window.location.href = "/it-asset-management"}
    >
      IT Asset Management System
    </button>

  </div> */}

</section>  

<section className="travel-faq-section">

      <h2 className="travel-faq-title">
        FAQ (Frequently Asked Questions)
      </h2>

      <div className="travel-faq-container">
        {travelFaqs.map((faq, index) => (
          <div
            className={`travel-faq-item ${
              openIndex === index ? "active" : ""
            }`}
            key={index}
          >
            <button
              className="travel-faq-question"
              onClick={() => handleToggle(index)}
              aria-expanded={openIndex === index}
            >
              <span className="travel-faq-arrow">
                {openIndex === index ? "▼" : "▶"}
              </span>

              <span>{faq.question}</span>
            </button>

            {openIndex === index && (
              <div className="travel-faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

    </section>
    </>
  )
}

export default Transport