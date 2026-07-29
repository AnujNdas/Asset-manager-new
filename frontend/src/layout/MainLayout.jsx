import { Outlet } from "react-router-dom";
import Navbar from "../Components/Mainpage/Navbar";
import Footer from "../Components/Mainpage/Footer";

const MainLayout = () => {
  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
};

export default MainLayout;