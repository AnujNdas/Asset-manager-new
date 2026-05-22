// src/Pages/AffiliateReferrals.jsx

import React, { useEffect, useState } from "react";
import {
  FaCopy,
  FaWhatsapp,
  FaLinkedin,
  FaExternalLinkAlt,
  FaUsers,
  FaMousePointer,
  FaMoneyBillWave,
  FaChartLine,
} from "react-icons/fa";

import "../../Page_styles/AffiliateReferrals.css";
import {
  getAffiliateDashboard,
} from "../../Services/AffiliateServices";

import ThemeSwal from "../utils/swalTheme";

export default function AffiliateReferrals() {
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState(null);
    useEffect(() => {
    fetchDashboard();
  }, []);
 const fetchDashboard = async () => {
    try {
      const res =
        await getAffiliateDashboard();

      setDashboard(res.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        dashboard?.affiliate?.referralLink
      );

      ThemeSwal.fire(
        "Copied",
        "Referral link copied successfully",
        "success"
      );
    } catch (err) {
      console.error(err);
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Manage your assets smarter with AMS 🚀\n\nSign up here:\n${dashboard?.affiliate?.referralLink}`
    );

    window.open(
      `https://wa.me/?text=${text}`,
      "_blank"
    );
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${dashboard?.affiliate?.referralLink}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="affiliate-loading">
        Loading affiliate dashboard...
      </div>
    );
  }

  const affiliate = dashboard?.affiliate;
  const stats = dashboard?.stats;

  return (
    <div className="affiliate-page">

      {/* ================= HERO ================= */}

      <div className="affiliate-hero">

        <div>
          <p className="affiliate-label">
            Affiliate Program
          </p>

          <h1>
            Welcome back,
            {" "}
            {affiliate?.fullName}
          </h1>

          <p className="affiliate-subtitle">
            Share your referral link and earn commissions.
          </p>
        </div>

        <div className="affiliate-status">
          {affiliate?.status}
        </div>
      </div>

      {/* ================= REFERRAL CARD ================= */}

      <div className="referral-card">

        <div className="referral-top">

          <div>
            <p className="referral-title">
              Your Referral Link
            </p>

            <h3>
              {affiliate?.affiliateCode}
            </h3>
          </div>

          <a
            href={affiliate?.referralLink}
            target="_blank"
            rel="noreferrer"
            className="visit-link"
          >
            <FaExternalLinkAlt />
          </a>
        </div>

        <div className="referral-link-box">
          {affiliate?.referralLink}
        </div>

        <div className="referral-actions">

          <button onClick={copyLink}>
            <FaCopy />
            Copy Link
          </button>

          <button onClick={shareWhatsApp}>
            <FaWhatsapp />
            WhatsApp
          </button>

          <button onClick={shareLinkedIn}>
            <FaLinkedin />
            LinkedIn
          </button>
        </div>
      </div>

      {/* ================= STATS ================= */}

      <div className="stats-grid">

        <div className="stat-card">
          <FaMousePointer className="stat-icon" />

          <h2>
            {affiliate?.totalClicks}
          </h2>

          <p>Total Clicks</p>
        </div>

        <div className="stat-card">
          <FaUsers className="stat-icon" />

          <h2>
            {affiliate?.totalReferrals}
          </h2>

          <p>Total Referrals</p>
        </div>

        <div className="stat-card">
          <FaChartLine className="stat-icon" />

          <h2>
            {affiliate?.totalConversions}
          </h2>

          <p>Total Conversions</p>
        </div>

        <div className="stat-card">
          <FaMoneyBillWave className="stat-icon" />

          <h2>
            ₹{affiliate?.totalEarnings}
          </h2>

          <p>Total Earnings</p>
        </div>
      </div>

      {/* ================= EXTRA STATS ================= */}

      <div className="mini-stats">

        <div className="mini-card">
          <span>Conversion Rate</span>

          <h3>
            {stats?.conversionRate}%
          </h3>
        </div>

        <div className="mini-card">
          <span>Today's Clicks</span>

          <h3>
            {stats?.clicksToday}
          </h3>
        </div>

        <div className="mini-card">
          <span>Today's Referrals</span>

          <h3>
            {stats?.referralsToday}
          </h3>
        </div>

        <div className="mini-card">
          <span>Today's Conversions</span>

          <h3>
            {stats?.conversionsToday}
          </h3>
        </div>
      </div>

      {/* ================= RECENT REFERRALS ================= */}

      <div className="recent-section">

        <div className="section-header">
          <h2>Recent Referrals</h2>
        </div>

        <div className="referral-table-wrapper">

          <table className="referral-table">

            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Organization</th>
                <th>Commission</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {dashboard?.recentReferrals?.length > 0 ? (
                dashboard.recentReferrals.map((item) => (
                  <tr key={item._id}>

                    <td>
                      {item?.referredUserId?.email ||
                        "Anonymous"}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${item.status}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      {item?.organizationId?.name ||
                        "-"}
                    </td>

                    <td>
                      ₹{item?.commissionAmount || 0}
                    </td>

                    <td>
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="empty-table"
                  >
                    No referrals yet
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}