import React from "react";
import "../Page_styles/OnboardingSlider.css";
import slide1 from "../Images/1.png";
import slide2 from "../Images/2.png";
import slide3 from "../Images/3.png";
import slide4 from "../Images/4.png";
import slide5 from "../Images/5.png";
import slide6 from "../Images/6.png";
import slide7 from "../Images/7.png";
import slide8 from "../Images/8.png";
import slide9 from "../Images/9.png";
import slide10 from "../Images/10.png";
export default function OnboardingSliderPage({ onClose }) {
const slides = [
  {
    id: 1,
    title: "Welcome to Socialfly AMS",
    subtitle: "Complete Asset Management Platform",
    description:
      "Get started with Socialfly AMS to manage hardware, software, inventory, assignments, and organization-wide asset tracking from one centralized dashboard.",
    image: slide1,
  },

  {
    id: 2,
    title: "Setup Classifications",
    subtitle: "Configure Locations, Units & Departments",
    description:
      "Begin by creating your organization structure inside Workforce → Classifications. Add locations, units, categories, and departments for proper asset organization.",
    image: slide2,
  },

  {
    id: 3,
    title: "Add Business Locations",
    subtitle: "Manage Offices & Asset Destinations",
    description:
      "Create and manage company locations such as cities, offices, branches, floors, and addresses where assets will be installed or assigned.",
    image: slide3,
  },

  {
    id: 4,
    title: "Configure Asset Units",
    subtitle: "Standardize Asset Measurements",
    description:
      "Set up units like devices, seats, terabytes, gigabytes, licenses, and concurrent users to accurately manage both hardware and software assets.",
    image: slide4,
  },

  {
    id: 5,
    title: "Create Departments",
    subtitle: "Organize Workforce Structure",
    description:
      "Add departments such as IT, Marketing, Operations, Sales, and Product Management to simplify asset ownership and employee assignments.",
    image: slide5,
  },

  {
    id: 6,
    title: "Capture New Assets",
    subtitle: "Add Hardware & Software Assets",
    description:
      "Create physical and digital assets with details like category, quantity, vendor, purchase dates, billing location, and lifecycle information.",
    image: slide6,
  },

  {
    id: 7,
    title: "Generate Asset Instances",
    subtitle: "Create Individual Trackable Records",
    description:
      "Convert assets into unique trackable instances with serial numbers, quantities, and stock availability for better inventory control.",
    image: slide7,
  },

  {
    id: 8,
    title: "Manage Asset Details",
    subtitle: "Track Costs, Warranty & Maintenance",
    description:
      "Add complete asset instance information including purchase cost, maintenance dates, insurance, warranty expiry, installation details, and location.",
    image: slide8,
  },

  {
    id: 9,
    title: "Assign Assets to Employees",
    subtitle: "Department-Based Asset Allocation",
    description:
      "Assign hardware and software instances to employees by selecting categories, assets, and departments while maintaining assignment history.",
    image: slide9,
  },

  {
    id: 10,
    title: "Track Asset Lifecycle",
    subtitle: "Monitor Usage, History & Reassignment",
    description:
      "View complete asset history including assignments, upgrades, maintenance, renewal costs, reassignment records, and lifecycle activities.",
    image: slide10,
  },
];

  const [currentSlide, setCurrentSlide] = React.useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const activeSlide = slides[currentSlide];

  return (
    <div className="onboarding-container">
      {/* Background Image */}
      <div
        className="background-image"
        style={{ backgroundImage: `url(${activeSlide.image})` }}
      />

      {/* Overlay */}
      <div className="overlay" />

      {/* Gradient Glow */}
      <div
        className="gradient-glow"
      />

      {/* Main Layout */}
      <div className="onboarding-content">
        {/* Header */}
        <div className="top-bar">
          <div>
            <h1 className="logo-title">
              Socialfly AMS
            </h1>
            <p className="logo-subtitle">
              Asset Management System
            </p>
          </div>

          <button
  className="skip-btn"
  onClick={onClose}
>
            Skip Tour
          </button>
        </div>

        {/* Content */}
        <div className="main-grid">
          {/* Left Content */}
          <div className="left-content">
            <div className="step-badge">
              Step {currentSlide + 1} of {slides.length}
            </div>

            <div className="text-content">
              <h2 className="main-title">
                {activeSlide.title}
              </h2>

              <h3 className="subtitle">
                {activeSlide.subtitle}
              </h3>

              <p className="description">
                {activeSlide.description}
              </p>
            </div>

            {/* Features */}
            <div className="feature-grid">
              {[
                "Real-Time Tracking",
                "Employee Assignment",
                "Inventory Monitoring",
                "Analytics Dashboard",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="feature-card"
                >
                  <div className="feature-item">
                    <div className="feature-dot" />
                    <span className="feature-text">
                      {feature}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="button-group">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="prev-btn"
              >
                Previous
              </button>

              {currentSlide === slides.length - 1 ? (
                <button
  className="start-btn"
  onClick={onClose}
>
                  Get Started
                </button>
              ) : (
                <button
                  onClick={nextSlide}
                  className="next-btn"
                >
                  Next
                </button>
              )}
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="right-panel">
            <div className="image-card">
              <img
                src={activeSlide.image}
                alt={activeSlide.title}
                className="preview-image"
              />

              {/* <div className="image-overlay">
                <div className="overlay-content">
                  <div>
                    <h4 className="overlay-title">
                      {activeSlide.title}
                    </h4>
                    <p className="overlay-subtitle">
                      Interactive onboarding experience
                    </p>
                  </div>

                  <div className="progress-dots">
                    {slides.map((_, index) => (
                      <div
                        key={index}
                        className={index === currentSlide ? "active-dot" : "inactive-dot"}
                      />
                    ))}
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Bottom Indicators */}
        <div className="bottom-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={index === currentSlide ? "indicator active-indicator" : "indicator"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
