import React from 'react'
import "../../Page_styles/LandingPage/ItAsset.css"
import { useState , useEffect } from 'react';
import { Helmet } from "react-helmet-async";
import {
  FaBriefcase,
  FaCoins,
  FaCalendarAlt,
    FaPlane,
  FaUtensils,
  FaHeartbeat,
  FaClipboard,
  FaToolbox,
  FaCog,
} from "react-icons/fa";

const faqData = [
  {
    question:
      "What is an IT Asset Management(ITAM) System / Software?",
    answer:
      "An IT Asset Management (ITAM) system is software used to track, manage, and monitor an organization's IT assets throughout their complete lifecycle. It provides a centralized record of hardware, software, licenses, users, locations, purchases, assignments, maintenance, renewals, and asset status."
  },
  {
    question:
      "What types of assets can AssetPegasus ITAM track?",
    answer:
      "AssetPegasus can track a wide range of IT and digital assets, including laptops, desktops, servers, monitors, networking equipment, software applications, software licenses, SaaS subscriptions, domains, cloud resources, and other technology assets. Organizations can maintain asset ownership, location, purchase, lifecycle, and compliance information in one place."
  },
  {
    question:
      "How does AssetPegasus help with software license compliance?",
    answer:
      "AssetPegasus helps organizations maintain visibility into software licenses, subscriptions, renewals, usage, and associated costs. Centralized license records and renewal alerts help teams identify upcoming expirations, avoid missed renewals, reduce unnecessary subscriptions, and maintain better control over software licensing requirements."
  },
  {
    question:
      "Do we need specialised IT skills to use this system?",
    answer:
      "No. AssetPegasus is designed with a simple and easy-to-use interface so that teams can manage assets without requiring specialized IT asset management expertise. Common activities such as adding assets, assigning equipment, tracking locations, reviewing lifecycle information, and monitoring alerts can be handled through the centralized dashboard."
  },
  {
    question:
      "What deployment options are available?",
    answer:
      "AssetPegasus can be offered through cloud-based deployment, allowing organizations to access their asset management system from anywhere. Depending on organizational requirements and data residency policies, deployment models can also include on-premise or hybrid environments where applicable."
  },
  {
    question:
      "Can AssetPegasus ITAM manage assets across multiple locations?",
    answer:
      "Yes. AssetPegasus can organize assets according to their locations, departments, users, and organizational units. This allows teams to maintain visibility across multiple offices, branches, facilities, and distributed locations while keeping asset information centralized."
  }
];

const industries = [
  {
    icon: <FaPlane />,
    title: "Travel & Transport Logistics",
  },
  {
    icon: <FaUtensils />,
    title: "Restaurant & Hospitality Management",
  },
  {
    icon: <FaHeartbeat />,
    title: "Healthcare Asset Tracking",
  },
  {
    icon: <FaClipboard />,
    title: "Education Asset Management",
  },
  {
    icon: <FaToolbox />,
    title: "Construction Equipment Tracking",
  },
  {
    icon: <FaCog />,
    title: "Manufacturing Asset Management",
  },
];

const topSlides = [
  "Software Licences Management System",
  "Machinery Assets Management System",
  "Transport Assets Management System",
];

const softwareCategories = [
  {
    id: 1,
    title: "Operating Systems",
    icons: "▢ ▢ ▢ ▢",
    content: (
      <>
        Windows, Linux Distributions
        <br />
        (Ubuntu, Red Hat, CentOS)
        <br />
        MacOS, iOS, Android, iPadOS
        <br />
        Virtualization Platforms
        <br />
        (VMware, Hyper-V, KVM)
      </>
    ),
  },

  {
    id: 2,
    title: "SaaS",
    icons: "📧 💬 📊 ☁️",
    content: (
      <>
        Subscription-based Applications
        <br />
        (AI, Salesforce, Zoom)
        <br />
        User Seats & Licenses
        <br />
        SaaS Integrations & APIs
        <br />
        Monitoring Tools (Datadog, Nagios,
        <br />
        SolarWinds)
        <br />
        Backup & Disaster Recovery Software
        <br />
        Configuration Management Tools
      </>
    ),
  },

  {
    id: 3,
    title: "Server & Cloud",
    icons: "🌐 🛠️ 📁 📦",
    content: (
      <>
        Shared, VPS & Dedicated Server
        <br />
        Virtual Machines (AWS EC2, Azure VMs,
        <br />
        GCP Compute)
        <br />
        Virtual Networks (VPCs, Subnets)
        <br />
        Application Hosting (Heroku, Elastic
        <br />
        Beanstalk)
        <br />
        Load Balancers (Cloud-native)
        <br />
        Containers & Orchestration (EKS, AKS,
        <br />
        GKE)
      </>
    ),
  },

  {
    id: 4,
    title: "Desktop Applications",
    icons: "📄 💾 🗄️ 🧬",
    content: (
      <>
        Office Suites
        <br />
        (Microsoft 365, Google Workspace)
        <br />
        Email Clients (Outlook, Thunderbird)
        <br />
        Web Browsers (Chrome, Edge, Firefox)
        <br />
        Collaboration Tools (Slack, Teams,
        <br />
        Zoom)
      </>
    ),
  },

  {
    id: 5,
    title: "Digital Accessories",
    icons: "🔌 🎨 🎬 ➕",
    content: (
      <>
        Domain Names
        <br />
        SSL/TLS Certificates
        <br />
        Website Content (CMS, Static Sites)
        <br />
        DNS Configurations & IP Address
        <br />
        Antivirus & Anti Malware
        <br />
        Plugins
      </>
    ),
  },

  {
    id: 6,
    title: "Databases & Datasets",
    icons: "🏛️ 🔄 🎭 🗄️",
    content: (
      <>
        SQL Databases (Microsoft SQL Server,
        <br />
        MySQL, PostgreSQL, Oracle)
        <br />
        NoSQL Databases (MongoDB,
        <br />
        Cassandra, Redis) & others
        <br />
        Customer Databases (CRM, ERP)
        <br />
        Storage Buckets (S3, Azure Blob, GCS)
      </>
    ),
  },

  {
    id: 7,
    title: "Creative & Design",
    icons: "🖌️ 📷 🎵 🎞️",
    content: (
      <>
        Graphic Design (Adobe Creative Cloud, Figma, Sketch)
        <br />
        Video Editing (Premiere Pro, Final Cut, DaVinci Resolve)
        <br />
        3D Modeling & CAD (AutoCAD, SolidWorks, Blender)
        <br />
        Audio Production (Pro Tools, Ableton)
      </>
    ),
  },

  {
    id: 8,
    title: "Enterprise System",
    icons: "🏭 🧑‍💼 🏗️ 🛠️",
    content: (
      <>
        Enterprise Resource Planning (ERP) (SAP, Oracle NetSuite)
        <br />
        Customer Relationship Management (CRM) (Salesforce, HubSpot)
        <br />
        Human Capital Management (Workday, BambooHR)
        <br />
        Project Management Softwares
      </>
    ),
  },
];


const lifecycleStages = [
  {
    id: 1,
    title: "Purchase",
    description:
      "Any asset originates with a business need. On the planning side, IT departments determine the necessary assets, evaluate the providers, compare, and place and raise purchase orders. At this stage, poor planning will result in over-purchasing, assets duplication and budgetary overrun.",
    secondary:
      "AssetPegasus IT Asset Management Software assists companies at this level by assisting them with an accurate data on the utilization of the available assets and thus companies will never buy what they already have but are not using. Every purchase order data are documented and directly attached to the asset since the beginning.",
    label: "(Purchase)",
  },

  {
    id: 2,
    title: "Assignment",
    description:
      "Once an asset has been purchased, it needs to be assigned to the appropriate employee, department, location, or operational unit. AssetPegasus maintains a clear record of who owns or uses each asset and where it is currently located.",
    secondary:
      "Asset assignment records provide complete accountability throughout the asset lifecycle. Teams can quickly determine who is responsible for an asset, where it is being used, and when an assignment changes.",
    label: "(Assignment)",
  },

  {
    id: 3,
    title: "Active Use & Monitoring",
    description:
      "During active use, assets require continuous monitoring to ensure they remain available, secure, and operational. AssetPegasus provides visibility into asset status, usage, location, maintenance schedules, warranties, and associated records.",
    secondary:
      "Continuous monitoring helps organizations identify problems before they become expensive failures. Asset information remains available from a centralized platform so teams can make informed operational decisions.",
    label: "(Active Use & Monitoring)",
  },

  {
    id: 4,
    title: "Maintenance & Support",
    description:
      "Every asset eventually requires maintenance, repairs, warranty services, or technical support. AssetPegasus keeps maintenance information, warranty dates, service records, and support details connected to the asset.",
    secondary:
      "Automated maintenance and warranty alerts help teams avoid missed service dates and unnecessary downtime while keeping a complete history of work performed throughout the asset lifecycle.",
    label: "(Maintenance & Support)",
  },

  {
    id: 5,
    title: "Optimization & License Management",
    description:
      "Organizations need to continuously evaluate whether assets are being utilized effectively. AssetPegasus helps identify underused resources, unnecessary purchases, software licenses, renewals, and opportunities to optimize asset utilization.",
    secondary:
      "By combining asset information with usage, cost, renewal, and license records, organizations can reduce unnecessary spending and improve the return on their technology investments.",
    label: "(Optimization & License Management)",
  },

  {
    id: 6,
    title: "Retirement & Disposal",
    description:
      "When an asset reaches the end of its useful life, it must be retired and disposed of correctly. AssetPegasus keeps the retirement process documented and ensures the asset's history remains available for future audits.",
    secondary:
      "Proper disposal records help organizations maintain compliance, protect sensitive information, and establish a complete lifecycle history from the original purchase through final retirement.",
    label: "(Retirement & Disposal)",
  },
];



const section6Images = [
  "/images/info.webp",
  "/images/healthcare.webp",
  "/images/construction.webp",
];


const industrySlides = [
  {
    title: "Manufacturing & Industrial Operations",
    text: `In contrast to traditional ITAM applications, AssetPegasus
    allows expanding the concept of asset management to factory
    machines and production equipment, along with safety devices.
    This makes it especially useful in manufacturing firms that
    require management of their IT setup as well as physical
    running resources from one platform.`,
  },

  {
    title: "Technology & IT Operations",
    text: `AssetPegasus gives IT teams complete visibility over laptops,
    servers, software licences, cloud subscriptions and other
    technology assets. Teams can track ownership, location,
    lifecycle status, maintenance and compliance from one platform.`,
  },

  {
    title: "Healthcare Organizations",
    text: `Healthcare organizations can track computers, medical
    equipment, security devices and other operational assets while
    maintaining complete records of ownership, location,
    maintenance and lifecycle history.`,
  },

  {
    title: "Education & Institutions",
    text: `Schools, colleges and universities can manage technology,
    classroom equipment and other physical assets while keeping
    complete records of assignments, locations, maintenance and
    lifecycle information.`,
  },

  {
    title: "Businesses & Enterprises",
    text: `Businesses of every size can centralize their hardware,
    software and operational assets. AssetPegasus provides a
    single source of truth for asset ownership, lifecycle,
    compliance, maintenance and operational visibility.`,
  },

  {
    title: "Government & Public Organizations",
    text: `Public organizations can maintain accurate asset records,
    monitor lifecycle events, manage assignments and improve
    accountability across departments and locations.`,
  },
];

const carouselItems = [
  {
    title: "Insurance & Contract Management",

    description:
      "In addition to conventional IT asset tracking, AssetPegasus IT Asset Management Software enables organizations to add insurance policy description, vendor contract and service level agreement to a particular asset. This is useful especially with high value hardware, special equipment and assets that are under third party maintenance contracts.",

    bottomText:
      "When you have insurance and contract details stored together with asset records, your team will never need to go and hunt down the filing cabinets or email history when a claim or a renewal arises. It is all available under a single roof, associated with the relevant asset, and can be accessed immediately. (Insurance & Contract Management)",
  },

  {
    title: "Maintenance Scheduling & Warranty Alerts",

    description:
      "Keep maintenance schedules, warranty information and service requirements connected directly to each asset. AssetPegasus helps teams stay ahead of important maintenance activities and warranty deadlines.",

    bottomText:
      "Automatic reminders help prevent missed maintenance and warranty dates while keeping the complete history associated with the relevant asset.",
  },

  {
    title: "Reporting, Analytics & Custom Dashboards",

    description:
      "Get a clear view of asset performance, costs, lifecycle information and operational activity through centralized reporting and customizable dashboards.",

    bottomText:
      "Turn asset information into useful operational insights with reports and dashboards designed around the needs of your organization.",
  },

  {
    title: "Security & Risk Management",

    description:
      "Identify outdated software, unauthorized devices and potential security risks across your asset environment from one centralized platform.",

    bottomText:
      "Maintain better visibility over your technology environment and respond quickly when assets require attention.",
  },

  {
    title: "GDPR & HIPAA Compliance",

    description:
      "Maintain organized asset records and supporting documentation to help your organization stay prepared for compliance requirements.",

    bottomText:
      "Keep important asset information available in one place so your organization can respond efficiently to audits and compliance requirements.",
  },

  {
    title: "Real Time Asset Discovery",

    description:
      "Maintain an up-to-date view of your organization's assets and their current status through centralized asset management.",

    bottomText:
      "Know what assets you have, where they are located and how they are being used without relying on disconnected spreadsheets.",
  },
];

const slides2 = [
  {
    title: "Why IT Asset Management (ITAM) Matters",
    description:
      "The IT asset management system builds a full auditable list of all your devices and applications. Security teams are able to see the devices with old software straight away, highlight questionable installations and make sure an asset is retired correctly when an employee no longer works at the organization.",
  },
  {
    title: "Complete Asset Visibility",
    description:
      "AssetPegasus gives your organization a centralized view of hardware, software, users, locations and asset lifecycle information so teams always know what they own and where it is.",
  },
  {
    title: "Reduce Security Risks",
    description:
      "Identify outdated software, unauthorized devices and assets that require attention before they become security or operational problems.",
  },
  {
    title: "Improve Asset Accountability",
    description:
      "Assign assets to employees, departments and locations while maintaining a clear record of ownership and responsibility throughout the asset lifecycle.",
  },
  {
    title: "Control Asset Costs",
    description:
      "Track purchase costs, maintenance expenses, renewals, warranties and other asset-related costs from one centralized platform.",
  },
  {
    title: "Automate Important Alerts",
    description:
      "Stay ahead of warranty expirations, maintenance schedules, insurance renewals, software renewals and other important asset events with automated notifications.",
  },
  {
    title: "Simplify Compliance",
    description:
      "Maintain organized asset records and supporting information that help your organization remain prepared for audits, security reviews and regulatory requirements.",
  },
  {
    title: "Make Better IT Decisions",
    description:
      "Use accurate asset information and reporting to understand your environment, identify gaps and make better decisions about purchases, renewals and asset retirement.",
  },
];
const slides = [
  {
    title: "Organize, Assign & Configure Alerts",

    description:
      "When your assets are in the software, place owners on it, locate it and place warranties and contracts with it, set up your maintenance process. Establish automatic notifications on any renewals, expiring warranties, planned maintenance and any security risks. Its whole system is directed through an easy to use dashboard, which does not necessitate any IT expertise to use.",
  },

  {
    title: "Track Every Asset Across Its Lifecycle",

    description:
      "Keep complete visibility of your assets from purchase and assignment through maintenance, renewal and disposal. AssetPegasus gives your team one centralized place to manage every stage of the asset lifecycle.",
  },

  {
    title: "Stay Ahead of Renewals & Maintenance",

    description:
      "Never miss important renewal dates, warranty expirations or scheduled maintenance. Configure automated alerts so your team can act before an asset becomes a problem or an important deadline is missed.",
  },

  {
    title: "Simple Asset Management for Every Team",

    description:
      "Manage your organization's assets through a simple and intuitive platform designed for everyday use. Give your teams the information they need without requiring specialized IT expertise.",
  },
];
const impactSlides = [
  {
    title: "The Business Impact of AssetPegasus",
    intro:
      "AssetPegasus does not just improve IT operations, it delivers measurable, tangible business outcomes that affect the entire organization.",
    heading: "Eliminating Compliance Risk",
    text:
      "In 2026, it is not possible to negotiate GDPR, HIPAA, and software license compliance requirements. AssetPegasus makes your organization always audit-ready, having all your assets recorded, compliance statements generated, and documented procedures available when required."
  },
  {
    title: "Reducing Operational Risk",
    intro:
      "AssetPegasus provides complete visibility across hardware, software, machinery, and other business assets.",
    heading: "Preventing Asset Blind Spots",
    text:
      "Track every asset throughout its lifecycle, including ownership, location, condition, maintenance, warranty, insurance, and disposal information."
  },
  {
    title: "Improving Asset Visibility",
    intro:
      "Bring your organization's asset information together in one centralized platform.",
    heading: "One Platform. Complete Visibility.",
    text:
      "Teams can quickly identify where assets are located, who is using them, their current status, associated costs, and upcoming maintenance or renewal requirements."
  },
  {
    title: "Controlling Asset Costs",
    intro:
      "Better asset visibility helps organizations make better financial decisions.",
    heading: "Reduce Unnecessary Spending",
    text:
      "Identify unused assets, unnecessary subscriptions, duplicate purchases, expired licenses, and avoidable maintenance costs before they impact your organization."
  }
];
const leftCategories = [
    {
      icon: "💻",
      title: "Operating System",
    },
    {
      icon: "🔒",
      title: "SaaS (software as a service)",
    },
    {
      icon: "🏭",
      title: "Server & Cloud",
    },
    {
      icon: "🤖",
      title: "Desktop Applications",
    },
  ];

  const rightCategories = [
    {
      icon: "🚚",
      title: "Digital Accessories",
    },
    {
      icon: "🛠️",
      title: "Creative & Design",
    },
    {
      icon: "🔌",
      title: "Enterprise System",
    },
    {
      icon: "🎧",
      title: "Data & Infrastructure",
    },
  ];

const ItAsswt = () => {

    const [activeSlide, setActiveSlide] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentSlide2, setCurrentSlide2] = useState(0);
    const [currentSlide3, setCurrentSlide3] = useState(0);
      const [topIndex, setTopIndex] = useState(0);
  const [industryIndex, setIndustryIndex] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
    const [openIndex, setOpenIndex] = useState(null);
    // section 2 carousel 

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) =>
        (current + 1) % impactSlides.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // section 4 carousels 

   // Top carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setTopIndex((prev) => (prev + 1) % topSlides.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Right-side carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setIndustryIndex((prev) => (prev + 1) % industrySlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentIndustry = industrySlides[industryIndex];


//   section 5 carousel 

useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide3((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // PREVIOUS
  // ==========================================

  const handlePrevious2 = () => {
    setCurrentSlide3((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  // ==========================================
  // NEXT
  // ==========================================

  const handleNext2 = () => {
    setCurrentSlide3((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  const slide = slides2[currentSlide];

  // section 6 carousel 

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % section6Images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // section 8 carousel 

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % lifecycleStages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentStage = lifecycleStages[activeStage];

  const selectStage = (index) => {
    setActiveStage(index);
  };


//   section 9 carousel .. 


  /* ==========================================
     AUTO CAROUSEL
  ========================================== */

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);


  /* ==========================================
     PREVIOUS
  ========================================== */

  const handlePrevious = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };


  /* ==========================================
     NEXT
  ========================================== */

  const handleNext = () => {
    setCurrentSlide((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };


  const slide2 = slides[currentSlide];


//   section 10 carousel 

useEffect(() => {

    const interval = setInterval(() => {

      setCurrentSlide2((prev) =>
        prev === carouselItems.length - 1
          ? 0
          : prev + 1
      );

    }, 5000);

    return () => clearInterval(interval);

  }, []);

  // section 17 faq 


  const toggleFaq = (index) => {
    setOpenIndex((current) =>
      current === index ? null : index
    );
  };
  return (
    <>

    <Helmet>
  <title>
    IT Asset Management Software | Track & Manage IT Assets 
      </title>

  <meta
    name="description"
    content="Manage and track IT hardware, software, licenses, warranties, maintenance, inventory, and asset lifecycles with AssetPegasus IT asset management software."
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
    content="IT Asset Management Software | AssetPegasus"
  />

  <meta
    property="og:description"
    content="Track IT hardware and software, manage licenses and warranties, monitor maintenance, and maintain complete visibility of your IT asset lifecycle with AssetPegasus."
  />

  <meta
    property="og:image"
    content="https://assetpegasus.com/images/info.webp"
  />

  <meta
    property="og:url"
    content="https://assetpegasus.com/itam-management"
  />

  <meta
    name="twitter:card"
    content="summary_large_image"
  />

  <meta
    name="twitter:title"
    content="IT Asset Management Software | AssetPegasus"
  />

  <meta
    name="twitter:description"
    content="Track IT hardware and software, manage licenses, warranties, maintenance, inventory, and asset lifecycles with AssetPegasus."
  />

  <meta
    name="twitter:image"
    content="https://assetpegasus.com/images/info.webp"
  />

  <link
    rel="canonical"
    href="https://assetpegasus.com/itam-management"
  />
</Helmet>


    <section className="itam-hero">

      {/* =====================================
          TOP HERO
      ===================================== */}

      <div className="itam-hero-top">

        <h1>
          Simple IT Asset Management (ITAM)
          <br />
          Software — AssetPegasus
        </h1>

      </div>


      {/* =====================================
          LOWER CONTENT
      ===================================== */}

      <div className="itam-hero-bottom">

        <div className="itam-hero-content">

          <div className="itam-breadcrumb">
            <a href="/">Home</a>
            <span> - </span>
            <span>IT Asset Management Software</span>
          </div>

          <h2>
            Simple IT Asset Management (ITAM) Software
            <br />
            that Scales With Your Business — AssetPegasus
          </h2>
          <p>
            A comprehensive Simple IT Asset Management (ITAM) Software – AssetPegasus, which Track every hardware, software & cloud asset worldwide. Reduce costs, stay compliant, manage renewals from one smart dashboard.
          </p>

        </div>

      </div>

    </section>

    <section className="itam-impact-section">

      <div className="itam-impact-container">

        {/* ================= LEFT ================= */}
        <div className="itam-features">

          <h2>Best Features</h2>

          <div className="itam-feature-list">

            <p>
              ☁️ Complete Cloud Deployment Options.
            </p>

            <p>
              🛡️ GDPR &amp; HIPAA Compliant.
            </p>

            <p>
              💳 No Credit Card Required. Start with 7 Days Free Trial.
            </p>

            <p>
              🎯 Track Every single Asset Across Its Full Lifecycle.
            </p>

            <p>
              🚨 Proactive Alerts for Security Risks, Expirations &amp; Changes.
            </p>

            <p>
              🤖 Automate License Reporting and Renewals.
            </p>

            <p>
              ⏱️ Unlock Modern Inventory &amp; with Best Visibility.
            </p>

          </div>

          <a
            href="/user/signup"
            className="itam-trial-button"
          >
            Start 7 Day Free Trial
          </a>

        </div>


        {/* ================= RIGHT ================= */}
        <div className="itam-impact-carousel">

          <div className="itam-slide-wrapper">

            <div
              key={activeSlide}
              className="itam-slide"
            >

              <h2>
                {impactSlides[activeSlide].title}
              </h2>

              <p className="itam-slide-intro">
                {impactSlides[activeSlide].intro}
              </p>

              <h3>
                {impactSlides[activeSlide].heading}
              </h3>

              <p className="itam-slide-text">
                {impactSlides[activeSlide].text}
              </p>

            </div>

          </div>


          {/* DOTS */}
          <div className="itam-carousel-dots">

            {impactSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={
                  index === activeSlide
                    ? "itam-dot active"
                    : "itam-dot"
                }
                onClick={() => setActiveSlide(index)}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}

          </div>

        </div>

      </div>

    </section>

    <section className="itam-section-3">

      {/* INTRODUCTION */}
      <div className="itam-section-3-intro">

        <p>
          Socialfly Simple IT Asset Management (ITAM) Software – AssetPegasus,
          gives IT teams and business owners complete, real time visibility
          over every asset they own.
          <br />
          From laptops and factory machines to software licenses and cloud
          subscriptions.
        </p>

        <p>
          Stop guessing what you own, where it is, and when it expires.
          Manage everything from one intelligent platform designed for
          businesses of all sizes, anywhere in the world.
        </p>

      </div>


      {/* MAIN CONTENT */}
      <div className="itam-section-3-content">

        {/* LEFT FEATURES */}
        <div className="itam-section-3-features">

          <div className="itam-feature-item">

            <div className="itam-feature-icon">
              <FaBriefcase />
            </div>

            <p>
              Manage All types of Assets From One Place —
              <br />
              Hardwares, Softwares & Clouds.
            </p>

          </div>


          <div className="itam-feature-item">

            <div className="itam-feature-icon">
              <FaCoins />
            </div>

            <p>
              Reduce Costs, Enhance Security & Build up an
              <br />
              Operational Performance.
            </p>

          </div>


          <div className="itam-feature-item">

            <div className="itam-feature-icon">
              <FaCalendarAlt />
            </div>

            <p>
              Manage Renewals, Maintenance & Warranty
              <br />
              Date with Insurance details.
            </p>

          </div>

        </div>


        {/* RIGHT IMAGE */}
        <div className="itam-section-3-image">

          <img
            src="/images/info.webp"
            alt="AssetPegasus IT asset management dashboard"
          />

        </div>

      </div>

    </section>

    <section className="itam-users-section">

      {/* =========================
          TOP CAROUSEL
      ========================== */}
      <div className="section4-top-carousel">

        <div className="top-carousel-window">
          <div
            className="top-carousel-track"
            style={{
              transform: `translateX(-${topIndex * 100}%)`,
            }}
          >
            {topSlides.map((slide, index) => (
              <div
                className="top-carousel-slide"
                key={index}
              >
                <h3>{slide}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="section4-top-dots">
          {topSlides.map((_, index) => (
            <button
              key={index}
              className={
                index === topIndex
                  ? "section4-dot active"
                  : "section4-dot"
              }
              onClick={() => setTopIndex(index)}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>

      </div>


      {/* =========================
          MAIN HEADING
      ========================== */}

      <h2 className="section4-main-heading">
        Who Uses IT Asset Management (ITAM) Software?
      </h2>


      {/* =========================
          MAIN CONTENT
      ========================== */}

      <div className="section4-content">

        {/* LEFT STATIC CONTENT */}

        <div className="section4-left">

          <p>
            AssetPegasus Simple IT Asset Management (ITAM)
            Software is set to cater to a broad demand among
            organizations in terms of industries, roles as well as
            geographies. In case your business owns, operates or
            relies on the assets of technological assets, then
            AssetPegasus ITAM is made for you.
          </p>

          <button
            className="section4-signup-btn"
            onClick={() => {
              window.location.href = "/signup";
            }}
          >
            Sign Up Now
          </button>

        </div>


        {/* RIGHT CAROUSEL */}

        <div className="section4-right">

          <div className="industry-carousel-window">

            <div
              className="industry-carousel-track"
              style={{
                transform: `translateX(-${industryIndex * 100}%)`,
              }}
            >

              {industrySlides.map((slide, index) => (
                <article
                  className="industry-slide"
                  key={index}
                >

                  <h3>{slide.title}</h3>

                  <p>{slide.text}</p>

                </article>
              ))}

            </div>

          </div>


          {/* INDUSTRY DOTS */}

          <div className="section4-industry-dots">

            {industrySlides.map((_, index) => (
              <button
                key={index}
                className={
                  index === industryIndex
                    ? "section4-dot active"
                    : "section4-dot"
                }
                onClick={() => setIndustryIndex(index)}
                aria-label={`Show industry ${index + 1}`}
              />
            ))}

          </div>

        </div>

      </div>

    </section>

    <section className="itam-section-5">

      <div className="itam-section-5-content">

        {/* LEFT ARROW */}

        <button
          type="button"
          className="itam-section-5-arrow itam-section-5-arrow-left"
          onClick={handlePrevious2}
          aria-label="Previous slide"
        >
          ‹
        </button>


        {/* RIGHT ARROW */}

        <button
          type="button"
          className="itam-section-5-arrow itam-section-5-arrow-right"
          onClick={handleNext2}
          aria-label="Next slide"
        >
          ›
        </button>


        {/* CAROUSEL */}

        <div
          className="itam-section-5-slide"
          key={currentSlide}
        >

          <h2>
            {slide.title}
          </h2>

          <p>
            {slide.description}
          </p>


          {/* DOTS */}

          <div className="itam-section-5-dots">

            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={
                  index === currentSlide
                    ? "active"
                    : ""
                }
                onClick={() => setCurrentSlide3(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}

          </div>


          {/* CTA */}

          <a
            href="/user/signup"
            className="itam-section-5-button"
          >
            Free Trial — No Card Required
          </a>

        </div>

      </div>

    </section>
    

    <section className="section6">

      <div className="section6-container">

        {/* ================= LEFT ================= */}

        <div className="section6-features">

          <div className="section6-feature">
            <div className="section6-icon">☑️</div>

            <h3>Easiest User experience</h3>

            <p>
              Capture all types of assets details with easiest
              way.
            </p>
          </div>


          <div className="section6-feature">
            <div className="section6-icon">🛡️</div>

            <h3>Security & Risk Management</h3>

            <p>
              Identify outdated software or unauthorized
              devices to fortify your organization’s security
              posture.
            </p>
          </div>


          <div className="section6-feature">
            <div className="section6-icon">📊</div>

            <h3>Drive Operational Efficiency</h3>

            <p>
              Eliminate manual tracking and human errors
              & improve asset allocation and internal
              workflows.
            </p>
          </div>

        </div>


        {/* ================= RIGHT ================= */}

        <div className="section6-carousel">

          <div className="section6-image-window">

            <div
              className="section6-image-track"
              style={{
                transform: `translateX(-${activeImage * 100}%)`,
              }}
            >

              {section6Images.map((image, index) => (
                <div
                  className="section6-slide"
                  key={index}
                >
                  <img
                    src={image}
                    alt={`Asset management dashboard ${index + 1}`}
                  />
                </div>
              ))}

            </div>

          </div>


          {/* DOTS */}

          <div className="section6-dots">

            {section6Images.map((_, index) => (
              <button
                key={index}
                className={
                  index === activeImage
                    ? "section6-dot active"
                    : "section6-dot"
                }
                onClick={() => setActiveImage(index)}
                aria-label={`Show dashboard ${index + 1}`}
              />

            ))}

          </div>

        </div>

      </div>

    </section>

    <section className="section7">
      <div className="section7-container">

        <div className="section7-stat">
          <div className="section7-number">500+</div>
          <p>
            Companies Trust Our
            <br />
            Solution
          </p>
        </div>

        <div className="section7-stat">
          <div className="section7-number">95%</div>
          <p>Uptime Guarantee</p>
        </div>

        <div className="section7-stat">
          <div className="section7-number">100%</div>
          <p>Automated Workflow</p>
        </div>

        <div className="section7-stat">
          <div className="section7-number">100%</div>
          <p>
            GDPR &amp; HIPAA
            <br />
            Compliant
          </p>
        </div>

      </div>
    </section>
    

    <section className="section8">

      <div className="section8-container">

        {/* =================================
            LEFT SIDE
        ================================= */}

        <div className="section8-left">

          <h2>The IT Asset Lifecycle Explained</h2>

          <div className="section8-stage-list">

            {lifecycleStages.map((stage, index) => (

              <button
                key={stage.id}
                className={
                  index === activeStage
                    ? "section8-stage active"
                    : "section8-stage"
                }
                onClick={() => selectStage(index)}
              >
                Stage {stage.id}: {stage.title}
              </button>

            ))}

          </div>

          <button className="section8-cta">
            Start 7 Day Free Trial
          </button>

        </div>


        {/* =================================
            RIGHT SIDE
        ================================= */}

        <div className="section8-right">

          {/* TOP CAROUSEL */}

          <div className="section8-top-carousel">

            <div className="section8-slide">

              <h3>{currentStage.title}</h3>

              <p>
                {currentStage.description}
              </p>

            </div>

          </div>


          {/* TOP DOTS */}

          <div className="section8-dots">

            {lifecycleStages.map((stage, index) => (

              <button
                key={stage.id}
                className={
                  index === activeStage
                    ? "section8-dot active"
                    : "section8-dot"
                }
                onClick={() => selectStage(index)}
                aria-label={`Show ${stage.title}`}
              />

            ))}

          </div>


          {/* BOTTOM CAROUSEL */}

          <div className="section8-bottom-carousel">

            <div className="section8-slide">

              <p>
                <span className="section8-secondary-title">
                  AssetPegasus IT Asset Management Software
                </span>{" "}
                {currentStage.secondary}
              </p>

              <p className="section8-label">
                {currentStage.label}
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>

     <section className="itam-section-9">

      <div className="itam-section-9-content">

        {/* LEFT ARROW */}
        <button
          type="button"
          className="itam-section-9-arrow itam-section-9-arrow-left"
          onClick={handlePrevious}
          aria-label="Previous slide"
        >
          ‹
        </button>


        {/* RIGHT ARROW */}
        <button
          type="button"
          className="itam-section-9-arrow itam-section-9-arrow-right"
          onClick={handleNext}
          aria-label="Next slide"
        >
          ›
        </button>


        {/* CAROUSEL CONTENT */}
        <div
          className="itam-section-9-slide"
          key={currentSlide}
        >

          <h2>
            {slide.title}
          </h2>

          <p>
            {slide.description}
          </p>


          {/* DOTS */}
          <div className="itam-section-9-dots">

            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`itam-section-9-dot ${
                  index === currentSlide ? "active" : ""
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}

          </div>


          {/* CTA */}
          <a
            href="/user/signup"
            className="itam-section-9-button"
          >
            Sign Up Now
          </a>

        </div>

      </div>

    </section>
    

    <section className="itam-section-10">

      <div className="itam-section-10-container">

        {/* =====================================
            LEFT STATIC CONTENT
        ===================================== */}

        <div className="itam-section-10-left">

          <h2>
            IT Asset Lifecycle Management
          </h2>


          <ul className="itam-section-10-features">

            <li>
              <span>⏱️</span>
              Real Time Asset Discovery
            </li>

            <li>
              <span>🛠️</span>
              Maintenance Scheduling & Warranty Alerts
            </li>

            <li>
              <span>📑</span>
              Insurance & Contract Management
            </li>

            <li>
              <span>📋</span>
              Reporting, Analytics & Custom Dashboards
            </li>

            <li>
              <span>⏰</span>
              Security & Risk Management
            </li>

            <li>
              <span>🔒</span>
              GDPR & HIPAA Compliance
            </li>

          </ul>


          <a
            href="/user/signup"
            className="itam-section-10-button"
          >
            Free Trial — No card Required
          </a>

        </div>


        {/* =====================================
            RIGHT CAROUSEL
        ===================================== */}

        <div className="itam-section-10-right">

          <div
            className="itam-section-10-carousel"
            key={currentSlide}
          >

            <h2>
              {carouselItems[currentSlide].title}
            </h2>


            <p className="itam-section-10-description">
              {carouselItems[currentSlide].description}
            </p>


            {/* DOTS */}

            <div className="itam-section-10-dots">

              {carouselItems.map((_, index) => (

                <button
                  key={index}
                  type="button"
                  className={
                    index === currentSlide
                      ? "active"
                      : ""
                  }
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />

              ))}

            </div>


            <p className="itam-section-10-bottom-text">
              {carouselItems[currentSlide].bottomText}
            </p>

          </div>

        </div>

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


     <section className="itam-section-12">
      <div className="itam-section-12-content">

        <h2>
          Take Full Control of Your IT Assets
          <br />
          with — AssetPegasus
        </h2>

        <div className="itam-section-12-columns">

          {/* LEFT COLUMN */}
          <div className="itam-section-12-column">
            <p>
              Every day you operate without a proper Simple Smart IT
              Asset Management (ITAM) Software is a day your
              organization is spending money it doesn’t need to spend,
              carrying compliance risks it doesn’t need to carry, and
              making IT decisions without the data it needs to make
              them well.
            </p>

            <ul>
              <li>
                No spreadsheets. No manual tracking. No compliance surprises.
              </li>

              <li>
                Complete management of lifecycle purchase to disposal.
              </li>
            </ul>
          </div>


          {/* RIGHT COLUMN */}
          <div className="itam-section-12-column">
            <p>
              AssetPegasus Simple IT Asset Management (ITAM)
              Software is a bill that provides you with the entire
              visibility of all hardware equipment, software licensing,
              and cloud-computing and all operational equipment of
              your organization in a single platform that is easy to
              install, simple to operate, and easy to scale with your
              business.
            </p>

            <ul>
              <li>
                Real time discovery, automatic alerts and audit ready
                reporting.
              </li>

              <li>
                Works for businesses of all sizes, anywhere in the world.
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
      
      <section className="software-assets-section">

      {/* Top clip-path transition */}
      <div className="software-assets-top-wave" />

      <div className="software-assets-container">

        <h2>All Manageable SOFTWARE ASSETS</h2>

        <div className="software-assets-grid">

          {softwareCategories.map((category) => (
            <article
              className={`software-asset-card ${
                category.id >= 7
                  ? "software-asset-card-wide"
                  : ""
              }`}
              key={category.id}
            >
              <div className="software-asset-icons">
                {category.icons}
              </div>

              <h3>{category.title}</h3>

              <p>{category.content}</p>
            </article>
          ))}

        </div>

      </div>

    </section>

    <section className="why-choose-section">
      <div className="why-choose-content">

        <h2>Why Businesses Choose AssetPegasus</h2>

        <h3>8+ Years of Building Digital Success Stories.</h3>

        <p className="intro-text">
          Small, Medium & Big Organizations require a simple flexible and
          scalable asset management platform which capable of managing
          complex asset environments.
        </p>

        <div className="assetpegasus-info">
          <h3>AssetPegasus</h3>

          <p>
            <a href="/about">HAM & ITAM</a> we bring all that expertise into a
            single SaaS (Software as Service) platform that helps to Manage
            Businesses & Individuals.
          </p>

          <a href="/about" className="about-btn">
            About Us
          </a>
        </div>

      </div>
    </section>

    <section className="section15">

      {/* TOP HEADER */}
      <div className="section15-header">
        <h2>IT Asset Management System</h2>

        <button className="section15-signup">
          Sign Up Now
          <span>→</span>
        </button>
      </div>

      {/* CENTER LABEL */}
      <div className="section15-visit">
        <p>Visit</p>
      </div>

      {/* MAIN CARD */}
      <div className="section15-card">

        <div className="section15-icon">
          💻
        </div>

        <h2>Equipment Asset Management</h2>

        <p>
          Manage All types of Physical Assets From One Place —
          <br />
          Machine, Equipment, Electronics &amp; Transport assets etc.
        </p>

      </div>

    </section>

    <section className="industry-assets-section">

      <h2>Manage Assets across Industries</h2>

      <div className="industry-assets-grid">
        {industries.map((industry, index) => (
          <div
            className={`industry-card industry-card-${index + 1}`}
            key={industry.title}
          >
            <div className="industry-icon">
              {industry.icon}
            </div>

            <p>{industry.title}</p>
          </div>
        ))}
      </div>

    </section>

    <section className="section17-faq">

      <div className="section17-container">

        <h2 className="section17-title">
          FAQ (Frequently Asked Questions)
        </h2>

        <div className="section17-list">

          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                className={`section17-item ${
                  isOpen ? "section17-item-open" : ""
                }`}
                key={index}
              >

                <button
                  type="button"
                  className="section17-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span className="section17-arrow">
                    {isOpen ? "▼" : "▶"}
                  </span>

                  <span>{faq.question}</span>
                </button>

                <div
                  className={`section17-answer ${
                    isOpen ? "section17-answer-open" : ""
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
  )
}

export default ItAsswt