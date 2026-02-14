import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", "G-5RLZ4G1GMX", {
        page_path: location.pathname + location.search,
      });
      console.log("Page tracked:", location.pathname);
    }
  }, [location]);

  return null;
};

export default AnalyticsTracker;
