import React from "react";
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
  physicalTitle = "Equipment Asset Management",
  physicalDescription = (
    <>
      Manage all types of <strong>Physical Assets</strong> from{" "}
      <strong>one place</strong> — Machines, Equipment, Electronics &
      Transport assets.
    </>
  ),
}) => {
  return (
    <section className="product-features-section">

      <h2 className="product-features-title">
        {title}
      </h2>

      <div className="product-features-grid">

        {/* DIGITAL ASSET */}
        <div className="product-feature-card">

          <div className="product-feature-icon">
            <FiBox />
          </div>

          <h3>
            {digitalTitle}
          </h3>

          <p>
            {digitalDescription}
          </p>

        </div>


        {/* PHYSICAL ASSET */}
        <div className="product-feature-card">

          <div className="product-feature-icon">
            <FiMonitor />
          </div>

          <h3>
            {physicalTitle}
          </h3>

          <p>
            {physicalDescription}
          </p>

        </div>

      </div>

    </section>
  );
};

export default ProductFeatures;