import { NavLink , useNavigate } from "react-router-dom";

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
        <h2>Affiliate Panel</h2>
      </div>

      <nav className="affiliate-nav">

        <NavLink to="/affiliate/dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/affiliate/earnings">
          Earnings
        </NavLink>

        <NavLink to="/affiliate/payouts">
          Payouts
        </NavLink>

<NavLink to="/affiliate/settings/profile">
  Settings
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