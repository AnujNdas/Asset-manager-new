import React from "react";
import "../Component_styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p className="copyright-box">
        <span>Copyright © 2025{" "}</span>
        <a
          href="https://socialflylive.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Socialfly - Business Growth & Management System
        </a>
      </p>
    </footer>
  );
};

export default Footer;
