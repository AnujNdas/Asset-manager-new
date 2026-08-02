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

            <Link to="/contact">
              Contact
            </Link>

            <Link to="/about">
              About Us
            </Link>

          </div>

          {/* Center */}

          <div className="footer-column footer-center">

       <Link
  to="/terms"
  onClick={() => window.scrollTo(0, 0)}
>
  Terms and Conditions
</Link>
            <a
              href="https://socialflylive.com/global-privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Global Privacy Policy
            </a>

          </div>

          {/* Right */}

          <div className="footer-column footer-right">

            <a
              href="https://socialflylive.com/it-asset-management-itam-software/"
              target="_blank"
              rel="noopener noreferrer"
            >
              IT Asset Management Software
            </a>

            <a
              href="https://socialflylive.com/machinery-assets-management/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Machinery Assets Management Software
            </a>

          </div>

        </div>

        <div className="icons-and-mails">

          <div className="social-icons">

            <a
              href="https://www.facebook.com/socialflylive/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>

            <a
              href="https://www.instagram.com/socialflylive"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>

            <a
              href="https://www.linkedin.com/company/socialflylive/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>

            <a
              href="https://www.google.com/maps/place/SocialTechner+%26+Socialfly/@43.932,-32.6777608,3z/data=!3m1!4b1!4m6!3m5!1s0x3a0275e10d495555:0x5fe8c0d82a4a28f!8m2!3d43.932!4d-32.6777608!16s%2Fg%2F11s8_1300s"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Maps"
            >
              <FaGoogle />
            </a>

            <a
              href="https://in.pinterest.com/socialflylive/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
            >
              <FaPinterestP />
            </a>

          </div>

          <p className="footer-email">
            Email:
            {" "}
            <a href="mailto:info@assetpegasus.com">
              info@assetpegasus.com
            </a>
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