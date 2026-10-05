import { NavLink, useNavigate } from "react-router-dom";
import {
  Database,
  Coins,
  LogOut,
  Settings,
  X
} from "lucide-react";

export default function AffiliateSidebar({
  isOpen,
  closeSidebar
}) {

  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.clear();

    navigate("/user/login");
  };


  const handleNavClick = () => {
    closeSidebar();
  };


  return (
    <aside
      className={`affiliate-sidebar ${
        isOpen ? "affiliate-sidebar-open" : ""
      }`}
    >

      {/* Mobile Close Button */}
      <button
        className="affiliate-sidebar-close"
        onClick={closeSidebar}
        aria-label="Close sidebar"
      >
        <X size={22} />
      </button>


      {/* Logo */}
      <div className="affiliate-logo">

        <img
          src="/images/Logo2.png"
          alt="Asset Pegasus"
        />

        <p>Affiliate Panel</p>

      </div>


      {/* Navigation */}
      <nav className="affiliate-nav">

        <NavLink
          to="/affiliate/dashboard"
          onClick={handleNavClick}
        >
          <Database size={16} />
          <span>Dashboard</span>
        </NavLink>


        <NavLink
          to="/affiliate/earnings"
          onClick={handleNavClick}
        >
          <Coins size={16} />
          <span>Earnings</span>
        </NavLink>


        <NavLink
          to="/affiliate/payouts"
          onClick={handleNavClick}
        >
          <LogOut size={16} />
          <span>Payouts</span>
        </NavLink>


        <NavLink
          to="/affiliate/settings/profile"
          onClick={handleNavClick}
        >
          <Settings size={16} />
          <span>Settings</span>
        </NavLink>

      </nav>


      {/* Logout */}
      <div className="affiliate-sidebar-footer">

        <button
          className="affiliate-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </aside>
  );
}