import React from "react";
import "../Component_styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="copyright-box">
        <div className="copy-text">
          Copyright © 2025{" "}
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
