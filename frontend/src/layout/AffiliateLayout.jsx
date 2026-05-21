import { Outlet } from "react-router-dom";
import AffiliateSidebar from "../Components/affiliate/AffiliateSidebar";
import "../Page_styles/Affiliate.css";

export default function AffiliateLayout() {
  return (
    <div className="affiliate-layout">

      <AffiliateSidebar />

      <div className="affiliate-content">
        <Outlet />
      </div>

    </div>
  );
}