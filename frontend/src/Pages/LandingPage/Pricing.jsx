import React from 'react'
import { Link } from "react-router-dom";
import "../../Page_styles/LandingPage/Pricing.css"
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const Pricing = () => {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState("yearly");
    const pricingData = {
        monthly: [
          {
            name: "Base",
            price: "$15",
            features: [
              "100 Hardware Asset",
              "100 Software Asset",
              "1 Admin User",
              "Multi-Location Management",
              "Complete Lifecycle Tracking",
              "SaaS Usage & License Tracking",
              "Role-Based Access (RBAC)",
              "Check-in / Check-out Tracking",
              "SAML / SSO Security",
              "Dedicated Account Manager",
              "Import & Export (xlsr,PDF etc.)",
              "Email Support",
            ],
          },
          {
            name: "Grow",
            price: "$30",
            features: [
              "2500 Hardware Asset",
              "2500 Software Asset",
              "5 Admin User",
              "Multi-Location Management",
              "Complete Lifecycle Tracking",
              "SaaS Usage & License Tracking",
              "Role-Based Access (RBAC)",
              "Check-in / Check-out Tracking",
              "SAML / SSO Security",
              "Dedicated Account Manager",
              "Import & Export (xlsr,PDF etc.)",
              "Dedicated Support",
            ],
          },
          {
            name: "Omni",
            price: "$90",
            features: [
              "Unlimited Hardware Asset",
              "Unlimited Software Asset",
              "Unlimited Admin User",
              "Multi-Location Management",
              "Complete Lifecycle Tracking",
              "SaaS Usage & License Tracking",
              "Role-Based Access (RBAC)",
              "Check-in / Check-out Tracking",
              "SAML / SSO Security",
              "Dedicated Account Manager",
              "Import & Export (xlsr,PDF etc.)",
              "Priority Support",
            ],
          },
        ],
    
        yearly: [
          {
            name: "Base",
            price: "$12",
            features: [
              "1000 Hardware Asset",
              "1000 Software Asset",
              "1 Admin User",
              "Multi-Location Management",
              "Complete Lifecycle Tracking",
              "SaaS Usage & License Tracking",
              "Role-Based Access (RBAC)",
              "Check-in / Check-out Tracking",
              "SAML / SSO Security",
              "Dedicated Account Manager",
              "Import & Export (xlsr,PDF etc.)",
              "Email Support",
            ],
          },
          {
            name: "Grow",
            price: "$25",
            features: [
              "2500 Hardware Asset",
              "2500 Software Asset",
              "5 Admin User",
              "Multi-Location Management",
              "Complete Lifecycle Tracking",
              "SaaS Usage & License Tracking",
              "Role-Based Access (RBAC)",
              "Check-in / Check-out Tracking",
              "SAML / SSO Security",
              "Dedicated Account Manager",
              "Import & Export (xlsr,PDF etc.)",
              "Dedicated Support",
            ],
          },
          {
            name: "Omni",
            price: "$75",
            features: [
              "Unlimited Hardware Asset",
              "Unlimited Software Asset",
              "Unlimited Admin User",
              "Multi-Location Management",
              "Complete Lifecycle Tracking",
              "SaaS Usage & License Tracking",
              "Role-Based Access (RBAC)",
              "Check-in / Check-out Tracking",
              "SAML / SSO Security",
              "Dedicated Account Manager",
              "Import & Export (xlsr,PDF etc.)",
              "Priority Support",
            ],
          },
        ],
      };
       const plans = pricingData[billingCycle];



       const handleCompetitor1 = () => {
        window.open("https://socialflylive.com/assetpegasus-vs-asset-panda/")
       }
       const handleCompetitor2 = () => {
        window.open("https://socialflylive.com/assetpegasus-vs-assettiger/")
       }
  return (
    <>
    <section className="pricing-hero-section">

  <h1>Pricing</h1>

  <div className="pricing-hero-breadcrumb">
    <Link to="/">Home</Link>
    <span> - Pricing</span>
  </div>

</section>

{/* SECTION 2 */}
<section className="pricing-section-2">
  <div className="pricing-section-2-content">
    <h2>AssetPegasus</h2>

    <h3>
      Machine &amp; IT asset lifecycle management platform
    </h3>
  </div>
</section>

<section className="pricing-section">

      {/* BILLING TOGGLE */}
      <div className="billing-toggle">

        <button
          className={billingCycle === "monthly" ? "active" : ""}
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly
        </button>

        <button
          className={billingCycle === "yearly" ? "active" : ""}
          onClick={() => setBillingCycle("yearly")}
        >
          Yearly
        </button>

      </div>

      {/* PRICING CARDS */}
      <div className="pricing-cards">

        {plans.map((plan) => (
          <div className="pricing-card" key={plan.name}>

            <h2>{plan.name}</h2>

            <div className="pricing-price">
              {plan.price}
              <span> / Month</span>
            </div>

            <div className="pricing-divider"></div>

            <ul>
              {plan.features.map((feature, index) => (
                <li key={index}>
                  {feature}
                </li>
              ))}
            </ul>

          </div>
        ))}

      </div>

      <div className="competitor-buttons">
        <button onClick={handleCompetitor1}>Competitor 1</button>
        <button onClick={handleCompetitor2}>Competitor 2</button>
      </div>

    </section>

    <section className="pricing-trial-section">

  <div className="pricing-trial-content">

    <div className="pricing-trial-text">
      <span>30 Days Free Trial</span>
      <span> – Machine & IT asset lifecycle</span>
      <br />
      <span>management platform</span>
    </div>

    <button
      className="pricing-trial-btn"
      onClick={() => navigate("/user/signup")}
    >
      <span>No Card Required</span>
      <span className="pricing-trial-arrow">→</span>
    </button>

  </div>

</section>
    </>
  )
}

export default Pricing