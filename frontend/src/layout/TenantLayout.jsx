import Menubar from "../Components/Menubar";
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

const TenantLayout = ({ profileUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isUserPage = location.pathname.startsWith("/user");

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
   <div className="app-wrapper">
  <button className="toggle-btn" onClick={toggleSidebar}>☰</button>

  <Sidebar 
    isOpen={isSidebarOpen}
    closeSidebar={closeSidebar}
  />

  <section className="second-container">
    <Menubar username={profileUser} />
  </section>

  <section className="third-container">
    <Outlet />
  </section>

  <section className="fourth-container">
    <Footer />
  </section>
</div>
  );
};

export default TenantLayout;
