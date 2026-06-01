import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../../Page_styles/AffiliateSettings.css";

const AffiliateSettingsLayout = () => {
  return (
    <div className="affiliate-settings-page">

      <div className="affiliate-settings-header">
        <h1>Affiliate Settings</h1>
        <p>
          Manage your profile, payouts and preferences.
        </p>
      </div>

      <div className="affiliate-settings-tabs">

        <NavLink
          to="/affiliate/settings/profile"
          className={({ isActive }) =>
            isActive
              ? "affiliate-settings-tab active"
              : "affiliate-settings-tab"
          }
        >
          Profile
        </NavLink>

        <NavLink
          to="/affiliate/settings/payout"
          className={({ isActive }) =>
            isActive
              ? "affiliate-settings-tab active"
              : "affiliate-settings-tab"
          }
        >
          Payouts
        </NavLink>

        <NavLink
          to="/affiliate/settings/preferences"
          className={({ isActive }) =>
            isActive
              ? "affiliate-settings-tab active"
              : "affiliate-settings-tab"
          }
        >
          Preferences
        </NavLink>

      </div>

      <div className="affiliate-settings-content">
        <Outlet />
      </div>

    </div>
  );
};

export default AffiliateSettingsLayout;