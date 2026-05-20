// src/Pages/AffiliateApply.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Page_styles/AffiliateApply.css";

export default function AffiliateApply() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    website: "",
    audienceType: "",
    promotionMethod: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // 🔥 API CALL HERE
      console.log(formData);

      // await applyAffiliate(formData)

      alert("Affiliate application submitted!");

      navigate("/user/login");

    } catch (err) {
      console.error(err);
      alert("Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="affiliate-page">

      {/* LEFT */}
      <div className="affiliate-left">

        <div className="affiliate-logo">
          <img
            src="/images/Logo.png"
            alt="Logo"
          />
        </div>

        <h1>Become an Affiliate Partner</h1>

        <p className="affiliate-subtitle">
          Help businesses discover our asset management platform
          and earn commissions for successful referrals.
        </p>

        <div className="affiliate-benefits">

          <div className="benefit-card">
            <h3>💰 Earn Commissions</h3>
            <p>
              Get rewarded for every successful subscription referral.
            </p>
          </div>

          <div className="benefit-card">
            <h3>📈 Real-Time Tracking</h3>
            <p>
              Monitor clicks, signups, conversions, and payouts.
            </p>
          </div>

          <div className="benefit-card">
            <h3>🚀 Scale With Us</h3>
            <p>
              Promote a growing SaaS platform trusted by organizations.
            </p>
          </div>

        </div>

      </div>

      {/* RIGHT */}
      <div className="affiliate-right">

        <form
          className="affiliate-form"
          onSubmit={handleSubmit}
        >

          <h2>Affiliate Application</h2>

          <div className="affiliate-grid">

            <div className="input-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Website / Portfolio</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Audience Type</label>

              <select
                name="audienceType"
                value={formData.audienceType}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="linkedin">LinkedIn Audience</option>
                <option value="youtube">YouTube Audience</option>
                <option value="blog">Blog / Website</option>
                <option value="agency">Agency Clients</option>
                <option value="community">Community</option>
                <option value="other">Other</option>
              </select>
            </div>

          </div>

          <div className="input-group">
            <label>How will you promote us?</label>

            <textarea
              rows="5"
              name="promotionMethod"
              value={formData.promotionMethod}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="affiliate-submit"
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : "Submit Application"}
          </button>

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/user/login")}
          >
            Back to Login
          </button>

        </form>

      </div>

    </div>
  );
}