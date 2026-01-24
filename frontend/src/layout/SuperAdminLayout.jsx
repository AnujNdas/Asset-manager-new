import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../Components/SuperAdminSidebar";
import "../Page_styles/SuperAdminLayout.css";
const SuperAdminLayout = () => {
  return (
    <div className="superadmin-wrapper">
      <SuperAdminSidebar />
      <main className="superadmin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
