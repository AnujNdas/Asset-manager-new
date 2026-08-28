import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGoogle,
  FaPinterestP,
} from "react-icons/fa";
const Footer = () => {
  const handleCopyright = () => {
    window.open("https://socialflylive.com/", "_blank");
  };

  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="contact-and-links">

          {/* Left */}

          <div className="footer-column footer-left">

            <Link to="/contact"   target="_blank"
  rel="noopener noreferrer">
              Contact
            </Link>

            <Link to="/about"   target="_blank"
  rel="noopener noreferrer">
              About Us
            </Link>

          </div>

          {/* Center */}

          <div className="footer-column footer-center">

       <Link
  to="/terms"
    target="_blank"
  rel="noopener noreferrer"
>
  Terms and Conditions
</Link>
            <Link
              to="/global-privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Global Privacy Policy
            </Link>

          </div>

          {/* Right */}

          <div className="footer-column footer-right">

            <Link
              to="/it-asset-management"
              target="_blank"
              rel="noopener noreferrer"
            >
              IT Asset Management Software
            </Link>

            <Link
              to="/machinery-management-software"
              target="_blank"
              rel="noopener noreferrer"
            >
              Machinery Assets Management Software
            </Link>

          </div>

        </div>

        <div className="icons-and-mails">

          <div className="social-icons">

            <Link
              to="https://www.facebook.com/socialflylive/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </Link>

            <Link
              to="https://www.instagram.com/socialflylive"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </Link>

            <Link
              to="https://www.linkedin.com/company/socialflylive/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </Link>

            <Link
              to="https://www.google.com/maps/place/SocialTechner+%26+Socialfly/@43.932,-32.6777608,3z/data=!3m1!4b1!4m6!3m5!1s0x3a0275e10d495555:0x5fe8c0d82a4a28f!8m2!3d43.932!4d-32.6777608!16s%2Fg%2F11s8_1300s"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Maps"
            >
              <FaGoogle />
            </Link>

            <Link
              to="https://in.pinterest.com/socialflylive/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
            >
              <FaPinterestP />
            </Link>

          </div>

          <p className="footer-email">
            Email:
            {" "}
            <Link to="mailto:info@assetpegasus.com"   target="_blank"
  rel="noopener noreferrer">
              info@assetpegasus.com
            </Link>
          </p>

        </div>

      </div>

      <div
        className="copyright"
        onClick={handleCopyright}
      >
        © 2026 Socialfly. All Rights Reserved.
      </div>

    </footer>
  );
};

export default Footer;