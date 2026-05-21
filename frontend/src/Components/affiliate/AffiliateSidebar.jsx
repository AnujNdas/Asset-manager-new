import { NavLink } from "react-router-dom";

export default function AffiliateSidebar() {
  return (
    <div className="affiliate-sidebar">

      <div className="affiliate-logo">
        <h2>Affiliate Panel</h2>
      </div>

      <nav className="affiliate-nav">

        <NavLink to="/affiliate/dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/affiliate/referrals">
          Referrals
        </NavLink>

        <NavLink to="/affiliate/earnings">
          Earnings
        </NavLink>

        <NavLink to="/affiliate/payouts">
          Payouts
        </NavLink>

        <NavLink to="/affiliate/profile">
          Profile
        </NavLink>

      </nav>

    </div>
  );
}