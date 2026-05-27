import React from "react";
import "../Page_styles/OnboardingSlider.css";
import slide1 from "../images/1.png";
import slide2 from "../images/2.png";
import slide3 from "../images/3.png";
import slide4 from "../images/4.png";
import slide5 from "../images/5.png";
import slide6 from "../images/6.png";
import slide7 from "../images/7.png";
import slide8 from "../images/8.png";
import slide9 from "../images/9.png";
import slide10 from "../images/10.png";
export default function OnboardingSliderPage({ onClose }) {
const slides = [
  {
    id: 1,
    title: "Welcome to Socialfly AMS",
    subtitle: "Smart Asset Management",
    description:
      "Manage and monitor organizational assets efficiently.",
    image: slide1,
  },

  {
    id: 2,
    title: "Inventory Tracking",
    subtitle: "Centralized Asset Control",
    description:
      "Track hardware and software assets in real time.",
    image: slide2,
  },

  {
    id: 3,
    title: "Assignments",
    subtitle: "Employee Asset Allocation",
    description:
      "Assign and monitor assets across departments.",
    image: slide3,
  },

  {
    id: 4,
    title: "Reports & Analytics",
    subtitle: "Visual Insights",
    description:
      "Generate reports and monitor asset performance.",
    image: slide4,
  },

  {
    id: 5,
    title: "License Management",
    subtitle: "Software Compliance",
    description:
      "Track licenses, expiries and renewals easily.",
    image: slide5,
  },

  {
    id: 6,
    title: "Maintenance Tracking",
    subtitle: "Lifecycle Monitoring",
    description:
      "Monitor repairs, warranty and maintenance history.",
    image: slide6,
  },

  {
    id: 7,
    title: "Employee Requests",
    subtitle: "Request Workflow",
    description:
      "Handle employee asset requests efficiently.",
    image: slide7,
  },

  {
    id: 8,
    title: "Notifications",
    subtitle: "Real-Time Alerts",
    description:
      "Stay updated with assignments and inventory events.",
    image: slide8,
  },

  {
    id: 9,
    title: "Organization Insights",
    subtitle: "Department Visibility",
    description:
      "View organization-wide asset utilization.",
    image: slide9,
  },

  {
    id: 10,
    title: "You're Ready",
    subtitle: "Start Managing Assets",
    description:
      "Begin using Socialfly AMS with complete control.",
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

              <div className="image-overlay">
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
              </div>
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
