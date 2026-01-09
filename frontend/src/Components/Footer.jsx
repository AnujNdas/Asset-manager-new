import React from "react";
import "../Component_styles/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="copyright-box">
        <div className="copy-text">
          Copyright © {currentYear}
        </div>

        <div className="copy-link">
          <a
            href="https://socialflylive.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Socialfly - Business Growth & Management System
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
