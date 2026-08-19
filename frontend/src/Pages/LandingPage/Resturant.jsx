import React from 'react'
import { useState , useEffect } from 'react';
import "../../Page_styles/LandingPage/Resturant.css"

const hospitalitySection10Items = [
  {
    title: "Benefits of Restaurant & Hospitality Asset Management",
    subtitle: "Increased Operational Efficiency",
    text: "Manual tracking and admin labor are minimized with automation.",
  },
  {
    title: "Benefits of Restaurant & Hospitality Asset Management",
    subtitle: "Reduced Equipment Downtime",
    text: "Preventive maintenance and timely alerts help restaurants avoid unexpected equipment failures.",
  },
  {
    title: "Benefits of Restaurant & Hospitality Asset Management",
    subtitle: "Better Asset Visibility",
    text: "Track equipment, locations, maintenance history and asset status from one centralized platform.",
  },
  {
    title: "Benefits of Restaurant & Hospitality Asset Management",
    subtitle: "Improved Cost Control",
    text: "Monitor maintenance expenses, lifecycle costs and asset utilization to make better purchasing decisions.",
  },
  {
    title: "Benefits of Restaurant & Hospitality Asset Management",
    subtitle: "Faster Compliance & Audits",
    text: "Digital asset records and maintenance history make inspections, audits and compliance reporting easier.",
  },
  {
    title: "Benefits of Restaurant & Hospitality Asset Management",
    subtitle: "Improved Guest Experience",
    text: "Reliable equipment and streamlined operations allow hospitality teams to focus on delivering better customer experiences.",
  },
];


const hospitalitySection8Items = [
  {
    image: "/images/construction.webp",
    alt: "Hospitality asset management dashboard",
  },
  {
    image: "/images/info.webp",
    alt: "Hospitality asset tracking dashboard",
  },
  {
    image: "/images/healthcare.webp",
    alt: "Hospitality asset management report",
  },
];

const restaurantSection7Items = [
  {
    title: "Inventory & Equipment Monitoring",
    text: (
      <>
        <strong>Track:</strong>

        <div className="restaurant-check-list">
          <span>✅ Kitchen appliances</span>
          <span>✅ Refrigeration systems</span>
          <span>✅ Furniture</span>
          <span>✅ POS systems</span>
          <span>✅ IT infrastructure</span>
          <span>✅ Housekeeping equipment</span>
          <span>✅ Facility maintenance tools</span>
        </div>

        <p>In a single seamless system.</p>
      </>
    ),
  },

  {
    title: "Preventive Maintenance Management",
    text: (
      <>
        <strong>Manage maintenance for:</strong>

        <div className="restaurant-check-list">
          <span>✅ Kitchen equipment</span>
          <span>✅ Refrigeration systems</span>
          <span>✅ HVAC systems</span>
          <span>✅ Laundry equipment</span>
          <span>✅ Plumbing and facility equipment</span>
        </div>

        <p>
          Schedule maintenance and reduce unexpected equipment failures.
        </p>
      </>
    ),
  },

  {
    title: "Asset Lifecycle Tracking",
    text: (
      <>
        <strong>Track every asset from:</strong>

        <div className="restaurant-check-list">
          <span>✅ Purchase</span>
          <span>✅ Deployment</span>
          <span>✅ Assignment</span>
          <span>✅ Maintenance</span>
          <span>✅ Replacement</span>
          <span>✅ Retirement</span>
        </div>

        <p>
          Maintain complete lifecycle visibility for every business asset.
        </p>
      </>
    ),
  },

  {
    title: "Real-Time Asset Visibility",
    text: (
      <>
        <strong>Monitor:</strong>

        <div className="restaurant-check-list">
          <span>✅ Asset location</span>
          <span>✅ Asset status</span>
          <span>✅ Assigned department</span>
          <span>✅ Maintenance status</span>
          <span>✅ Asset availability</span>
        </div>

        <p>
          Give restaurant and hospitality teams complete operational visibility.
        </p>
      </>
    ),
  },

  {
    title: "Warranty & Insurance Tracking",
    text: (
      <>
        <strong>Keep track of:</strong>

        <div className="restaurant-check-list">
          <span>✅ Warranty expiration</span>
          <span>✅ Insurance coverage</span>
          <span>✅ Renewal dates</span>
          <span>✅ Service information</span>
          <span>✅ Important alerts</span>
        </div>

        <p>
          Avoid missed renewals and unexpected asset-related costs.
        </p>
      </>
    ),
  },

  {
    title: "Reporting & Operational Insights",
    text: (
      <>
        <strong>Get better visibility through:</strong>

        <div className="restaurant-check-list">
          <span>✅ Asset reports</span>
          <span>✅ Maintenance records</span>
          <span>✅ Cost tracking</span>
          <span>✅ Asset utilization</span>
          <span>✅ Lifecycle information</span>
        </div>

        <p>
          Make better purchasing, maintenance and operational decisions.
        </p>
      </>
    ),
  },
];


const restaurantCarouselItems2 = [
  {
    title: "Faster Compliance & Audits",
    text: (
      <>
        Amenities that must be adhered to by facilities providing hospitality
        services are:
        <br /><br />

        ✅ Food safety regulations<br />
        ✅ Hygiene standards<br />
        ✅ Maintenance inspections<br />
        ✅ Fire safety requirements<br />
        ✅ Equipment servicing guidelines

        <br /><br />

        Recording procedures using digital audit trails and automatic
        compliance reporting makes inspections easier and makes them more
        accountable.
      </>
    ),
  },

  {
    title: "Reduced Equipment Downtime",
    text: (
      <>
        Lessons can be interrupted in case there are any unforeseen issues
        with ovens, refrigerators, HVAC units, or the point of sale.
        Sudden failures of any type can cause interruptions and a decline
        in the level of service.
      </>
    ),
  },

  {
    title: "Better Asset Visibility",
    text: (
      <>
        Get complete visibility into restaurant and hospitality equipment
        including kitchen appliances, refrigeration systems, POS equipment,
        furniture, HVAC systems and other operational assets.
      </>
    ),
  },

  {
    title: "Preventive Maintenance Management",
    text: (
      <>
        Schedule preventive maintenance, monitor equipment condition and
        receive timely alerts so critical equipment can be serviced before
        it causes operational disruption.
      </>
    ),
  },
];

const restaurantCarouselItems = [
  {
    title: "Free Trial — No Card Required",
    text: (
      <>
        An up to date asset management system supports businesses by:
        <br /><br />

        <span>✅ Track asset locations in real time</span><br />
        <span>✅ Monitor maintenance schedules</span><br />
        <span>✅ Reduce equipment downtime</span><br />
        <span>✅ Improve operational efficiency</span>
      </>
    ),
  },

  {
    title: "Restaurant Equipment Management",
    text: (
      <>
        Manage kitchen equipment, refrigeration systems, POS systems,
        furniture, HVAC equipment and other operational assets from one
        centralized platform.
      </>
    ),
  },

  {
    title: "Maintenance & Compliance Tracking",
    text: (
      <>
        Schedule preventive maintenance, monitor warranties and receive
        alerts before important restaurant and hospitality equipment
        requires attention.
      </>
    ),
  },

  {
    title: "Multi-Location Asset Visibility",
    text: (
      <>
        Track equipment and operational assets across restaurants, hotels,
        cafés and multiple locations while maintaining complete visibility
        from one platform.
      </>
    ),
  },

  {
    title: "Improve Operational Efficiency",
    text: (
      <>
        Reduce manual asset tracking, minimize downtime and give your teams
        better visibility into equipment, maintenance and operational costs.
      </>
    ),
  },
];


const Resturant = () => {

    const [restaurantActiveSlide, setRestaurantActiveSlide] = useState(0);
    const [restaurantActiveSlide2, setRestaurantActiveSlide2] = useState(0);
    const [activeSlide3, setActiveSlide3] = useState(0);
    const [activeSlide8, setActiveSlide8] = useState(0);
    const [activeSlide10, setActiveSlide10] = useState(0);
    // carousel for section 3 


useEffect(() => {
  const interval = setInterval(() => {
    setRestaurantActiveSlide(
      (current) =>
        current === restaurantCarouselItems.length - 1
          ? 0
          : current + 1
    );
  }, 4500);

  return () => clearInterval(interval);
}, []);


// carousel for section 6 
useEffect(() => {
  const interval = setInterval(() => {
    setRestaurantActiveSlide2(
      (current) =>
        current === restaurantCarouselItems2.length - 1
          ? 0
          : current + 1
    );
  }, 4500);

  return () => clearInterval(interval);
}, []);

// carousel for section 7 

useEffect(() => {
  const interval = setInterval(() => {
    setActiveSlide3(
      (prev) =>
        (prev + 1) % restaurantSection7Items.length
    );
  }, 4500);

  return () => clearInterval(interval);
}, []);

// carousel for section 8

useEffect(() => {
  const interval = setInterval(() => {
    setActiveSlide8(
      (prev) => (prev + 1) % hospitalitySection8Items.length
    );
  }, 4500);

  return () => clearInterval(interval);
}, []);

// carousel for section 9

useEffect(() => {
  const interval = setInterval(() => {
    setActiveSlide10(
      (prev) => (prev + 1) % hospitalitySection10Items.length
    );
  }, 4500);

  return () => clearInterval(interval);
}, []);
  return (
    <>

    {/* SECTION 1 */}
<section className="manufacturing-hero">

  {/* Dark top layer with clipped bottom */}
  <div className="manufacturing-hero-top">
    <h1>
      Resturant & Hospitality Asset <br/> Management
    </h1>
  </div>

  {/* Lower content */}
  <div className="manufacturing-hero-bottom">

    <div className="manufacturing-breadcrumb">
      <a href="/">Home</a>
      <span> - Manufacturing Asset Management Software</span>
    </div>

    <h2>
      AssetPegasus – Simple Manufacturing Asset Management Software
      <br />
      that Scales With Your Business.
    </h2>

  </div>

</section>

<section className="hospitality-section-2">
  <div className="hospitality-section-2-content">

    <p>
      Speed, efficiency, consistency and amazing customer experiences are the
      lifeblood of the restaurant and hospitality sector. Whether it’s
      restaurants, cafés, hotels or resorts, they maintain hundreds of assets
      on a daily basis, from equipment and point of sale to refrigeration,
      furniture, HVAC, housekeeping and IT assets, etc. etc.
    </p>

    <p>
      When there is no centralised management system, this can make these
      assets hard to track, resulting in equipment downtime, operational
      delays, compliance problems and higher maintenance costs. Restaurants
      and hotels can get full visibility into their assets, automate
      maintenance, optimize operations, and provide exceptional service
      experiences through the help of restaurant and hospitality asset
      management software.
    </p>

  </div>
</section>

<section className="hospitality-section-3">

  <div className="hospitality-section-3-content">

    <img
      src="/images/construction.webp"
      alt="Restaurant and hospitality asset management dashboard"
      className="hospitality-dashboard-image"
    />

  </div>

</section>

<section className="restaurant-section-3">

  {/* LEFT SIDE */}
  <div className="restaurant-section-3-features">

    <h2>Best Features</h2>

    <ul>
      <li>
        ☁️ Cloud, Hybrid & On Premise Deployment Options.
      </li>

      <li>
        🛡️ GDPR & HIPAA Compliant.
      </li>

      <li>
        💳 No Credit Card Required. Start with 7 Days Free Trial.
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

    <a
      href="/signup"
      className="restaurant-section-3-trial-btn"
    >
      Free Trial — No Card Required
    </a>

  </div>


  {/* RIGHT SIDE CAROUSEL */}
  <div className="restaurant-section-3-carousel">

    <h2>
      {restaurantCarouselItems[restaurantActiveSlide].title}
    </h2>

    <a
      href="/signup"
      className="restaurant-section-3-signup-btn"
    >
      Sign Up
    </a>

    <div className="restaurant-section-3-carousel-content">

      <div
        key={restaurantActiveSlide}
        className="restaurant-section-3-slide"
      >
        <p>
          {restaurantCarouselItems[restaurantActiveSlide].text}
        </p>
      </div>

    </div>

    <div className="restaurant-section-3-dots">

      {restaurantCarouselItems.map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Show slide ${index + 1}`}
          className={
            index === restaurantActiveSlide
              ? "active"
              : ""
          }
          onClick={() => setRestaurantActiveSlide(index)}
        />
      ))}

    </div>

  </div>

</section>

<section className="hospitality-section-5">

  {/* TOP CONTENT */}
  <div className="hospitality-section-5-top">

    <div className="hospitality-section-5-heading">
      <h2>
        Why Restaurants & Hospitality Businesses Need Asset Management
        Software
      </h2>

      <p>
        In the world of restaurants and hospitality businesses, time is of
        the essence even a small problem with the equipment can affect
        customers and business cash flow.
      </p>

      <p>
        Modern asset management software is a solution to major challenges
        faced in operation of assets.
      </p>
    </div>

  </div>


  {/* BOTTOM CONTENT */}
  <div className="hospitality-section-5-bottom">

    {/* LEFT */}
    <div className="hospitality-section-5-left">

      <p>
        Asset management software can aid businesses:
      </p>

      <ul>
        <li>Schedule preventive maintenance</li>
        <li>Monitor equipment condition</li>
        <li>Automate repair requests</li>
        <li>Reduce unexpected breakdowns</li>
      </ul>

      <p>
        Reduce downtimes and achieve operational reliability through
        preventive maintenance.
      </p>

    </div>


    {/* RIGHT */}
    <div className="hospitality-section-5-right">

      <h3>
        Reduced Equipment Downtime
      </h3>

      <p>
        <span className="hospitality-arrow">▶</span>
        Lessons can be interrupted in case there are any unforeseen issues
        with ovens, refrigerators, HVAC units, or the point of sale. Sudden
        failures of any type, such as ovens, refrigerators, HVAC point of
        sale, can cause interruptions and a decline in the level of service.
      </p>

    </div>

  </div>

</section>

<section className="restaurant-section-6">
    <h2> Resturant & Hospitality Asset Management</h2>

  <div className="restaurant-section-6-grid">

    {/* LEFT SIDE */}
    <div className="restaurant-section-6-left">

      <h2>
        Key Features of AssetPegasus for Restaurant &
        <br />
        Hospitality Asset Management
      </h2>

      <ul>

        <li>
          <strong>Real-Time Asset Tracking</strong>

          <span>
            Track the condition, location and status of equipment
            real time.
          </span>
        </li>

        <li>
          <strong>QR Code Tracking</strong>

          <span>
            Instantly scan assets while using mobile devices to
            update asset data.
          </span>
        </li>

        <li>
          <strong>Preventive Maintenance Scheduling</strong>

          <span>
            Programmed alerts for maintenance to minimise
            equipment downtime.
          </span>
        </li>

      </ul>

    </div>


    {/* RIGHT CAROUSEL */}
    <div className="restaurant-section-6-carousel">

      <div
        key={restaurantActiveSlide2}
        className="restaurant-section-6-slide"
      >

        <h2>
          {restaurantCarouselItems2[restaurantActiveSlide2].title}
        </h2>

        <div className="restaurant-section-6-slide-text">
          {restaurantCarouselItems2[restaurantActiveSlide2].text}
        </div>

      </div>


      {/* DOTS */}
      <div className="restaurant-section-6-dots">

        {restaurantCarouselItems2.map((_, index) => (

          <button
            key={index}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            className={
              index === restaurantActiveSlide2
                ? "active"
                : ""
            }
            onClick={() => setRestaurantActiveSlide2(index)}
          />

        ))}

      </div>


      {/* SIGN UP */}
      <a
        href="/signup"
        className="restaurant-section-6-signup"
      >
        Sign Up Now
      </a>

    </div>

  </div>

</section>

<section className="restaurant-section-7">

  <div className="restaurant-section-7-header">

    <h2>
      Key Features of Restaurant & Hospitality Asset Management Software
    </h2>

    <p>
      This is a list of the features that a modern hospitality asset
      management platform should contain:
    </p>

  </div>


  <div
    key={activeSlide3}
    className="restaurant-section-7-carousel"
  >

    <h3>
      {restaurantSection7Items[activeSlide3].title}
    </h3>

    <div className="restaurant-section-7-content">
      {restaurantSection7Items[activeSlide3].text}
    </div>

  </div>


  {/* DOTS */}

  <div className="restaurant-section-7-dots">

    {restaurantSection7Items.map((_, index) => (

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


  {/* SIGN IN */}

  <a
    href="/signup"
    className="restaurant-section-7-signin"
  >
    Sign In Now
  </a>

</section>

<section className="hospitality-section-8">

  <div className="hospitality-section-8-title">
    <h2>
      The Future of Hospitality Asset Management
    </h2>
  </div>


  <div className="hospitality-section-8-content">

    {/* LEFT SIDE */}

    <div className="hospitality-section-8-features">

      <p>
        The hospitality industry is rapidly adopting:
      </p>

      <div className="hospitality-check-item">
        <span>✅</span>
        <span>Cloud based management systems</span>
      </div>

      <div className="hospitality-check-item">
        <span>✅</span>
        <span>Smart maintenance automation</span>
      </div>

      <div className="hospitality-check-item">
        <span>✅</span>
        <span>Mobile first operations</span>
      </div>

      <div className="hospitality-check-item">
        <span>✅</span>
        <span>Real-time operational dashboards</span>
      </div>

    </div>


    {/* RIGHT SIDE IMAGE CAROUSEL */}

    <div className="hospitality-section-8-carousel">

      <div
        key={activeSlide8}
        className="hospitality-section-8-image-wrapper"
      >
        <img
          src={
            hospitalitySection8Items[activeSlide8].image
          }
          alt={
            hospitalitySection8Items[activeSlide8].alt
          }
        />
      </div>


      {/* DOTS */}

      <div className="hospitality-section-8-dots">

        {hospitalitySection8Items.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Show image ${index + 1}`}
            className={
              index === activeSlide8
                ? "active"
                : ""
            }
            onClick={() => setActiveSlide8(index)}
          />
        ))}

      </div>

    </div>

  </div>

</section>

<section className="hospitality-section-9">

  <div className="hospitality-section-9-content">

    <p>
      Effective asset management systems are essential for today’s restaurant
      and hospitality enterprises to remain competitive, delight their guests,
      and boost their operational efficiencies.
    </p>

    <p>
      The constantly changing expectations of customers mean that asset
      management software will be instrumental in ensuring that hospitality
      brands run operations scale-up effectively with reduced resources and
      high levels of service.
    </p>

  </div>


  <div className="hospitality-section-9-stats">

    <div className="hospitality-stat">
      <h2>500+</h2>
      <p>Companies Trust Our<br />Solution</p>
    </div>

    <div className="hospitality-stat">
      <h2>95%</h2>
      <p>Uptime Guarantee</p>
    </div>

    <div className="hospitality-stat">
      <h2>100%</h2>
      <p>Automated Workflow</p>
    </div>

    <div className="hospitality-stat">
      <h2>100%</h2>
      <p>GDPR &amp; HIPAA<br />Compliant</p>
    </div>

  </div>

</section>

<section className="hospitality-section-10">

  <div className="hospitality-section-10-content">

    {/* LEFT SIDE */}

    <div className="hospitality-section-10-left">

      <h2>
        Analytics & Reporting
      </h2>

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

      <p className="hospitality-section-10-ending">
        Facilitating intelligent business decisions.
      </p>

    </div>


    {/* RIGHT SIDE CAROUSEL */}

    <div className="hospitality-section-10-carousel">

      <a
        href="/signup"
        className="hospitality-section-10-signup"
      >
        Sign In Now
      </a>


      <div
        key={activeSlide10}
        className="hospitality-section-10-slide"
      >

        <h2>
          {hospitalitySection10Items[activeSlide10].title}
        </h2>

        <h3>
          {hospitalitySection10Items[activeSlide10].subtitle}
        </h3>

        <p>
          {hospitalitySection10Items[activeSlide10].text}
        </p>

      </div>


      {/* DOTS */}

      <div className="hospitality-section-10-dots">

        {hospitalitySection10Items.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            className={
              index === activeSlide10
                ? "active"
                : ""
            }
            onClick={() => setActiveSlide10(index)}
          />
        ))}

      </div>

    </div>

  </div>

</section>

<section className="hospitality-section-11">

  <div className="hospitality-section-11-content">

    <h2>
      Restaurant & Hospitality Asset Management with AssetPegasus
    </h2>

    <p className="hospitality-section-11-intro">
      AssetPegasus offers a modern, scalable asset management that caters to
      the needs of restaurants, hotels, cafés, resorts and hospitality
      businesses, helping them streamline operations and gain insights into
      their assets.
    </p>

    <p className="hospitality-section-11-subtitle">
      With AssetPegasus platform, businesses can:
    </p>


    <ul className="hospitality-section-11-list">

      <li>
        <span>✓</span>
        Track operational assets in real time
      </li>

      <li>
        <span>✓</span>
        Manage maintenance schedules efficiently
      </li>

      <li>
        <span>✓</span>
        Monitor equipment lifecycle and warranties
      </li>

      <li>
        <span>✓</span>
        Reduce downtime and operational disruptions
      </li>

      <li>
        <span>✓</span>
        Centralize asset information across multiple locations
      </li>

      <li>
        <span>✓</span>
        Improve compliance and audit readiness
      </li>

      <li>
        <span>✓</span>
        Generate detailed reports and analytics
      </li>

      <li>
        <span>✓</span>
        Optimize operational efficiency
      </li>

    </ul>


    <p className="hospitality-section-11-ending">
      It enables them to streamline their facility assets, hardware, software,
      and cloud configuration into a single console for better service delivery
      and hospitality operation modernization.
    </p>


    <a
      href="/signup"
      className="hospitality-section-11-button"
    >
      Sign In Now
    </a>

  </div>

</section>

<section className="hospitality-section-12">

  <div className="hospitality-section-12-clip"></div>

  <div className="hospitality-section-12-content">

    <h2>
      Types of Assets Restaurants & Hospitality Businesses Can Track
    </h2>

    <p className="hospitality-section-12-intro">
      There are systems for managing assets in restaurants and hospitality,
      all of which can track:
    </p>

    <p className="hospitality-section-12-assets">
      Ovens and fryers, Refrigerators and freezers, POS systems,
      Tablets and kiosks, Coffee machines, HVAC systems, Kitchen equipment,
      Hotel room appliances, Furniture and fixtures, Housekeeping equipment,
      Laundry equipment, Audio-visual systems, IT hardware, Security systems,
      Catering equipment, Banquet assets
      <br />
      Fleet and delivery vehicles.
    </p>

    <p className="hospitality-section-12-ending">
      Single visibility enhances efficiency and minimize losses.
    </p>

  </div>

</section>

{/* SECTION 13 */}
<section className="hospitality-section-13">

  <div className="hospitality-section-13-content">

    <h2>
      Why Businesses Choose Socialfly
    </h2>

    <h3>
      8+ Years of Building Digital Success Stories.
    </h3>

    <p>
      Small, Medium &amp; Big Organizations require a simple flexible and
      scalable asset management platform which capable of managing
      complex asset environments.
    </p>

    <p>
      <a href="/about">
        HAM &amp; ITAM
      </a>{" "}
      we bring all that expertise into a single SaaS (Software as Service)
      platform that helps to Manage Businesses &amp; Individuals.
    </p>

    <a
      href="/about"
      className="hospitality-section-13-button"
    >
      About Us
    </a>

  </div>

</section>

{/* SECTION 14 */}
<section className="hospitality-section-14">

  <div className="hospitality-industry-cards">

    {/* CARD 1 */}
    <a href="/travel-transportation" className="hospitality-industry-card">
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
    </a>


    {/* CARD 2 */}
    <a href="/healthcare" className="hospitality-industry-card industry-card-raised">
      <div className="hospitality-industry-icon">
        ∿
      </div>

      <h3>
        Healthcare
        <br />
        Asset
        <br />
        Tracking
      </h3>
    </a>


    {/* CARD 3 */}
    <a href="/education" className="hospitality-industry-card">
      <div className="hospitality-industry-icon">
        ▢
      </div>

      <h3>
        Education
        <br />
        Asset
        <br />
        Management
      </h3>
    </a>


    {/* CARD 4 */}
    <a href="/construction" className="hospitality-industry-card industry-card-raised">
      <div className="hospitality-industry-icon">
        🧰
      </div>

      <h3>
        Construction
        <br />
        Equipment
        <br />
        Tracking
      </h3>
    </a>


    {/* CARD 5 */}
    <a href="/manufacturing" className="hospitality-industry-card">
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
    </a>

  </div>

</section>

<section className="manufacturing-section-15">
        <div className="manufacturing-section-15-links">
        <h2>Asset Management System</h2>

  <a href="/signup" className="section-15-signup">
    Sign Up Now →
  </a>

        </div>
  
  <div className="section-15-visit">
    Visit
  </div>

  <div className="manufacturing-section-15-links">
    <a href="/equipment-management">
      Equipment Asset Management System
    </a>

    <a href="/itam-management">
      IT Asset Management System
    </a>
  </div>

</section>

<section className="hospitality-section-16">

  <h2>FAQ (Frequently Asked Questions)</h2>

  <div className="hospitality-faq">

    <details>
      <summary>
        What is Restaurant & Hospitality asset management software?
      </summary>
      <p>
        Restaurant and hospitality asset management software helps restaurants,
        hotels, cafés, resorts and other hospitality businesses track and manage
        their physical and operational assets from a centralized platform. It
        provides visibility into asset location, condition, maintenance,
        warranties, lifecycle information and operational status.
      </p>
    </details>

    <details>
      <summary>
        Why do Restaurant & Hospitality need asset tracking software?
      </summary>
      <p>
        Restaurants and hospitality businesses manage a large number of assets
        such as kitchen equipment, refrigeration systems, HVAC units, POS
        systems, furniture and housekeeping equipment. Asset tracking software
        helps reduce misplacement, unexpected breakdowns and downtime while
        giving teams better visibility and control over their equipment.
      </p>
    </details>

    <details>
      <summary>
        How does asset lifecycle management help Restaurant & Hospitality business?
      </summary>
      <p>
        Asset lifecycle management allows hospitality businesses to track
        equipment from purchase and deployment through active use, maintenance,
        upgrades and eventual replacement or disposal. This helps businesses
        plan maintenance, control costs, improve asset utilization and make
        better replacement and purchasing decisions.
      </p>
    </details>

    <details>
      <summary>
        Can asset management software track Restaurant & Hospitality equipment?
      </summary>
      <p>
        Yes. Asset management software can track a wide range of hospitality
        equipment, including ovens, refrigerators, freezers, coffee machines,
        HVAC systems, POS equipment, kitchen appliances, furniture, housekeeping
        equipment, IT hardware and other operational assets.
      </p>
    </details>

    <details>
      <summary>
        Is asset management software useful for multiple Restaurant & Hospitality locations?
      </summary>
      <p>
        Yes. AssetPegasus can provide centralized visibility across multiple
        restaurants, hotels, cafés, resorts and other locations. Teams can
        monitor where assets are located, track transfers, manage maintenance
        schedules and maintain asset records across different facilities from
        one system.
      </p>
    </details>

  </div>

</section>
    </>
  )
}

export default Resturant