import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../../Page_styles/AffiliateSettings.css";

const AffiliateSettingsLayout = () => {
  return (
    <div className="affiliate-settings-page">

      <div className="affiliate-settings-sidebar">

        <h2>Affiliate Settings</h2>

        <NavLink
          to="/affiliate/settings/profile"
          className={({ isActive }) =>
            isActive
              ? "affiliate-settings-link active"
              : "affiliate-settings-link"
          }
        >
          👤 Profile
        </NavLink>

        <NavLink
          to="/affiliate/settings/payout"
          className={({ isActive }) =>
            isActive
              ? "affiliate-settings-link active"
              : "affiliate-settings-link"
          }
        >
          💳 Payouts
        </NavLink>

        <NavLink
          to="/affiliate/settings/preferences"
          className={({ isActive }) =>
            isActive
              ? "affiliate-settings-link active"
              : "affiliate-settings-link"
          }
        >
          ⚙ Preferences
        </NavLink>

      </div>

      <div className="affiliate-settings-content">
        <Outlet />
      </div>

    </div>
  );
};

export default AffiliateSettingsLayout;