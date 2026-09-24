import { NavLink , useNavigate } from "react-router-dom";
import {
  Database,
  Coins,
  LogOut,
  Settings
} from "lucide-react"

export default function AffiliateSidebar() {
    const navigate = useNavigate();
    const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.clear();

    navigate("/user/login");
  };
  return (
    <div className="affiliate-sidebar">

      <div className="affiliate-logo">
        <img src="/images/Logo2.png" alt="logo" />
        <h2>Affiliate Panel</h2>
      </div>

      <nav className="affiliate-nav">

        <NavLink to="/affiliate/dashboard">
          <Database size={14}/> Dashboard
        </NavLink>

        <NavLink to="/affiliate/earnings">
          <Coins size={14}/> Earnings
        </NavLink>

        <NavLink to="/affiliate/payouts">
          <LogOut size={14}/> Payouts
        </NavLink>

<NavLink to="/affiliate/settings/profile">
  <Settings size={14}/> Settings
</NavLink>

      </nav>
    <div className="affiliate-sidebar-footer">
        <button
          className="affiliate-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}