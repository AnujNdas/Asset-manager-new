import { NavLink } from "react-router-dom";

import {
  X,
  LayoutDashboard,
  Building2,
  Ticket,
  Activity,
  HeartPulse,
  ChartNoAxesCombined,
  Settings,
} from "lucide-react";

import "../Component_styles/SuperAdminSidebar.css";


const links = [
  {
    to: "/super-admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/super-admin/organizations",
    label: "Organizations",
    icon: Building2,
  },
  // {
  //   to: "/super-admin/analytics",
  //   label: "Analytics",
  //   icon: BarChart3,
  // },
  {
    to: "/super-admin/tickets",
    label: "Tickets",
    icon: Ticket,
  },
  {
    to: "/super-admin/activity",
    label: "Activity",
    icon: Activity,
  },
  {
    to: "/super-admin/health",
    label: "Health",
    icon: HeartPulse,
  },
  {
    to: "/super-admin/financials",
    label: "Financial",
    icon: ChartNoAxesCombined,
  },
  {
    to: "/super-admin/settings",
    label: "Settings",
    icon: Settings,
  },
];


const handleClick = () => {
  localStorage.removeItem("superAdminToken");

  window.location.href = "/user/login";
};


const SuperAdminSidebar = ({
  isOpen,
  closeSidebar
}) => {

  const handleNavigation = () => {
    closeSidebar();
  };


  return (
    <aside
      className={`sa-sidebar ${
        isOpen ? "sa-sidebar--open" : ""
      }`}
    >

      {/* =====================================================
          MOBILE CLOSE BUTTON
      ===================================================== */}

      <button
        className="sa-sidebar__close"
        onClick={closeSidebar}
        aria-label="Close sidebar"
      >
        <X size={21} />
      </button>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sa-sidebar__header">
        Super Admin
      </div>


      {/* =====================================================
          PANEL
      ===================================================== */}

      <div className="sa-panel">

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="sa-sidebar__nav">

          {links.map((link) => {

            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `sa-sidebar__link ${
                    isActive ? "active" : ""
                  }`
                }
              >

                <Icon
                  className="sa-sidebar__icon"
                  size={17}
                  strokeWidth={2}
                />

                <span>
                  {link.label}
                </span>

              </NavLink>
            );

          })}

        </nav>


        {/* ===================================================
            LOGOUT
        =================================================== */}

        <div className="sa-actions">

          <button
            className="Logout-btn"
            onClick={handleClick}
          >
            Logout
          </button>

        </div>

      </div>

    </aside>
  );
};


export default SuperAdminSidebar;