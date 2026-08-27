import React from "react";
import { useNavigate } from "react-router-dom";
import { FiBox, FiMonitor } from "react-icons/fi";
import "../../Component_styles/ProductFeature.css";

const ProductFeatures = ({
  title = "Product Features",
  digitalTitle = "IT Asset Management",
  digitalDescription = (
    <>
      Manage all types of <strong>Digital Assets</strong> from{" "}
      <strong>one place</strong> — Software, Servers, Domains & Cloud
      assets etc.
    </>
  ),
  digitalUrl = "/it-asset-management",

  physicalTitle = "Machinery Asset Management",
  physicalDescription = (
    <>
      Manage all types of <strong>Physical Assets</strong> from{" "}
      <strong>one place</strong> — Machines, Equipment, Electronics &
      Transport assets.
    </>
  ),
  physicalUrl = "/machinery-management-software",
}) => {

  const navigate = useNavigate();

  const handleNavigate = (url) => {
    navigate(url);

    // Wait for React Router to render the new page
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }, 0);
  };

  return (
    <section className="product-features-section">

      <h2 className="product-features-title">
        {title}
      </h2>

      <div className="product-features-grid">

        {/* DIGITAL ASSET */}
        <div
          className="product-feature-card"
          onClick={() => handleNavigate(digitalUrl)}
        >
          <div className="product-feature-icon">
            <FiBox />
          </div>

          <h3>{digitalTitle}</h3>

          <p>{digitalDescription}</p>
        </div>


        {/* PHYSICAL ASSET */}
        <div
          className="product-feature-card"
          onClick={() => handleNavigate(physicalUrl)}
        >
          <div className="product-feature-icon">
            <FiMonitor />
          </div>

          <h3>{physicalTitle}</h3>

          <p>{physicalDescription}</p>
        </div>

      </div>

    </section>
  );
};


export default ProductFeatures;