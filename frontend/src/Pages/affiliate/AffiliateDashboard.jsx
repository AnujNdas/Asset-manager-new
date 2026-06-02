import React, { useEffect, useState } from "react";
import "../../Page_styles/AffiliateDashboard.css";

import Loader from "../../Components/Loader";

import {
  FaCopy,
  FaExternalLinkAlt,
  FaUsers,
  FaMousePointer,
  FaMoneyBillWave,
  FaChartLine,
} from "react-icons/fa";

import {
  getAffiliateDashboard,
} from "../../Services/AffiliateServices";

const AffiliateDashboard = () => {
  const [loading, setLoading] = useState(true);

  const [affiliate, setAffiliate] =
    useState(null);

  const [stats, setStats] =
    useState(null);

  const [recentReferrals, setRecentReferrals] =
    useState([]);

  const fetchDashboard = async () => {
    try {
      const res =
        await getAffiliateDashboard();

      setAffiliate(res.affiliate);
      setStats(res.stats);
      setRecentReferrals(
        res.recentReferrals || []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(
      affiliate?.referralLink || ""
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="affiliate-dashboard">

      {/* HERO */}

      <div className="dashboard-top-grid">

        <div className="dashboard-card hero-card">

          <span className="card-label">
            AFFILIATE PROGRAM
          </span>

          <h1>
            Welcome back,
            <br />
            {affiliate?.fullName}
          </h1>

          <p>
            Share your referral link and
            earn commissions.
          </p>

          <div
            className={`affiliate-status ${affiliate?.status}`}
          >
            {affiliate?.status}
          </div>

        </div>

        <div className="dashboard-card link-card">

          <div className="link-header">

            <div>
              <span>Your Referral Link</span>

              <h3>
                {affiliate?.affiliateCode}
              </h3>
            </div>

            <a
              href={affiliate?.referralLink}
              target="_blank"
              rel="noreferrer"
            >
              <FaExternalLinkAlt />
            </a>

          </div>

          <div className="referral-link-box">
            {affiliate?.referralLink}
          </div>

          <button
            className="copy-btn"
            onClick={copyReferralLink}
          >
            <FaCopy />
            Copy Link
          </button>

        </div>

      </div>

      {/* KPI */}

      <div className="kpi-grid">

        <div className="dashboard-card stat-card">
          <FaMousePointer />
          <h2>{affiliate?.totalClicks}</h2>
          <p>Total Clicks</p>
        </div>

        <div className="dashboard-card stat-card">
          <FaUsers />
          <h2>{affiliate?.totalReferrals}</h2>
          <p>Total Referrals</p>
        </div>

        <div className="dashboard-card stat-card">
          <FaChartLine />
          <h2>
            {affiliate?.totalConversions}
          </h2>
          <p>Total Conversions</p>
        </div>

        <div className="dashboard-card stat-card">
          <FaMoneyBillWave />
          <h2>
            $
            {affiliate?.totalEarnings?.toFixed(
              2
            )}
          </h2>
          <p>Total Earnings</p>
        </div>

        <div className="dashboard-card stat-card">
          <h2>
            {stats?.conversionRate}%
          </h2>
          <p>Conversion Rate</p>
        </div>

        <div className="dashboard-card stat-card">
          <h2>
            $
            {affiliate?.pendingEarnings?.toFixed(
              2
            )}
          </h2>
          <p>Pending Earnings</p>
        </div>

        <div className="dashboard-card stat-card">
          <h2>
            $
            {affiliate?.paidEarnings?.toFixed(
              2
            )}
          </h2>
          <p>Paid Earnings</p>
        </div>

      </div>

      {/* BOTTOM */}

      <div className="dashboard-bottom-grid">

        <div className="dashboard-card">

          <h2>
            Recent Referrals
          </h2>

          <table className="referral-table">

            <thead>
              <tr>
                <th>User</th>
                <th>Organization</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {recentReferrals.map(
                (item) => (
                  <tr key={item._id}>
                    <td>
                      {item.referredUserId
                        ?.email || "-"}
                    </td>

                    <td>
                      {item.organizationId
                        ?.name || "-"}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${item.status}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        <div className="dashboard-card">

          <h2>
            Today's Activity
          </h2>

          <div className="today-stats">

            <div>
              <span>
                Clicks
              </span>

              <h3>
                {stats?.clicksToday}
              </h3>
            </div>

            <div>
              <span>
                Referrals
              </span>

              <h3>
                {stats?.referralsToday}
              </h3>
            </div>

            <div>
              <span>
                Conversions
              </span>

              <h3>
                {stats?.conversionsToday}
              </h3>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AffiliateDashboard;