import React from "react";
import "../Component_styles/Footer.css";
import { FiExternalLink } from "react-icons/fi";
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
 
<footer className="footer-card">
  <div className="copyright-box">

    {/* LEFT — COPYRIGHT */}
    <div className="footer-left">
      <span className="footer-copyright">
        © {currentYear} AssetPegasus
      </span>

      <span className="footer-separator" />

      <span className="footer-description">
        Asset Management System
      </span>
    </div>

    {/* RIGHT — COMPANY CREDIT */}
    <div className="footer-right">
      <span className="footer-powered">
        Developed by
      </span>

      <a
        href="https://socialflylive.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="footer-company-link"
      >
        SOCIALFLY
        <FiExternalLink className="footer-external-icon" />
      </a>

      <span className="footer-rights">
        All Rights Reserved.
      </span>
    </div>

  </div>
</footer>

  );
};

export default Footer;
