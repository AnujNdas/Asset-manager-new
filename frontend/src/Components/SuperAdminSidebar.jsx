import { NavLink } from "react-router-dom";
import "../Component_styles/SuperAdminSidebar.css";
const links = [
  { to: "/super-admin/dashboard", label: "Dashboard" },
  { to: "/super-admin/organizations", label: "Organizations" },
  { to: "/super-admin/settings", label: "Settings" },
  // { to: "/super-admin/analytics", label: "Analytics" },
  { to: "/super-admin/tickets", label: "Tickets" },
  { to: "/super-admin/activity", label: "Activity" },
  { to: "/super-admin/health", label: "health" },
];
const handleClick = () => {
  localStorage.removeItem("superAdminToken");
  window.location.href = "/user/login";
}
const SuperAdminSidebar = () => {
  return (
    <aside className="sa-sidebar">
      <div className="sa-sidebar__header">Super Admin</div>

      <nav className="sa-sidebar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sa-sidebar__link ${isActive ? "active" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
        <button className="Logout-btn" onClick={handleClick}>Logout</button>
      </nav>
    </aside>
  );
};

export default SuperAdminSidebar;
