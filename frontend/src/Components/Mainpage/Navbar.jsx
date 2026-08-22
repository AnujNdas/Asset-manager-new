import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(
      openDropdown === dropdown ? null : dropdown
    );
  };

  const handleSigninClick = () => {
    navigate("/user/login");
    closeMenu();
  };

  const handleSignupClick = () => {
    navigate("/user/signup");
    closeMenu();
  };

  const handleTutorialClick = () => {
    window.open(
      "https://youtu.be/M4L6AeK-ckY",
      "_blank"
    );
    closeMenu();
  };

  return (
    <>
      <nav className="navbar">

        {/* LOGO */}
        <div className="logo">
          <img src="/images/Logo2.png" alt="" />
        </div>

        {/* DESKTOP NAVIGATION */}
        <ul className="nav-menu">

          <li>
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>
          </li>

          <li>
            <Link to="/about" onClick={closeMenu}>
              About
            </Link>
          </li>

          {/* DROPDOWN 1 - 2 LINKS */}
          <li className="dropdown">
            <button
              className="dropdown-toggle"
              onClick={() => toggleDropdown("features")}
            >
              Features
              <FiChevronDown
                className={
                  openDropdown === "features"
                    ? "chevron rotate"
                    : "chevron"
                }
              />
            </button>

            {openDropdown === "features" && (
              <div className="dropdown-menu-navbar">
                <Link
                  to="/machinery-management-software"
                  onClick={closeMenu}
                >
                  Machinery Asset Management Software
                </Link>

                <Link
                  to="/it-asset-management"
                  onClick={closeMenu}
                >
                  IT Asset Management Software
                </Link>
              </div>
            )}
          </li>

          {/* DROPDOWN 2 - 6 LINKS */}
          <li className="dropdown">
            <button
              className="dropdown-toggle"
              onClick={() => toggleDropdown("solutions")}
            >
              Solutions
              <FiChevronDown
                className={
                  openDropdown === "solutions"
                    ? "chevron rotate"
                    : "chevron"
                }
              />
            </button>

            {openDropdown === "solutions" && (
              <div className="dropdown-menu-navbar">
                <Link to="/manufacturing-asset-management-software" onClick={closeMenu}>
                  Manufacturing Asset Management Software
                </Link>

                <Link to="/restaurant-hospitality-asset-management" onClick={closeMenu}>
                  Resturant Hospitality Asset Management 
                </Link>

                <Link to="/healthcare-asset-tracking" onClick={closeMenu}>
                  Healthcare Asset Tracking 
                </Link>

                <Link to="/construction-equipment-tracking" onClick={closeMenu}>
                  Construction Equipment Tracking
                </Link>

                <Link to="/education-asset-management" onClick={closeMenu}>
                  Education Asset Management 
                </Link>

                <Link to="/help-center" onClick={closeMenu}>
                  Travel & Transport Asset Management Software
                </Link>
              </div>
            )}
          </li>

          <li>
            <Link to="/contact" onClick={closeMenu}>
              Contact
            </Link>
          </li>

        </ul>

        {/* DESKTOP ACTIONS */}
        <div className="nav-actions">

          <button
            className="signin-btn"
            onClick={handleTutorialClick}
          >
            Tutorial
          </button>

          <button
            className="signin-btn"
            onClick={handleSigninClick}
          >
            Sign In
          </button>

          <button
            className="signup-btn"
            onClick={handleSignupClick}
          >
            Sign Up
          </button>

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>

      </nav>

      {/* MOBILE MENU */}
      <div
        className={`mobile-menu ${
          mobileMenuOpen ? "active" : ""
        }`}
      >

        <Link to="/" onClick={closeMenu}>
          Home
        </Link>

        <Link to="/about" onClick={closeMenu}>
          About
        </Link>

        {/* MOBILE DROPDOWN 1 */}
        <div className="mobile-dropdown">

          <button
            className="mobile-dropdown-toggle"
            onClick={() => toggleDropdown("mobile-solutions")}
          >
            <span>Solutions</span>

            <FiChevronDown
              className={
                openDropdown === "mobile-solutions"
                  ? "chevron rotate"
                  : "chevron"
              }
            />
          </button>

          {openDropdown === "mobile-solutions" && (
            <div className="mobile-dropdown-links">

              <Link
                to="/asset-management"
                onClick={closeMenu}
              >
                Asset Management
              </Link>

              <Link
                to="/software-license-management"
                onClick={closeMenu}
              >
                Software License Management
              </Link>

            </div>
          )}

        </div>

        {/* MOBILE DROPDOWN 2 */}
        <div className="mobile-dropdown">

          <button
            className="mobile-dropdown-toggle"
            onClick={() => toggleDropdown("mobile-resources")}
          >
            <span>Resources</span>

            <FiChevronDown
              className={
                openDropdown === "mobile-resources"
                  ? "chevron rotate"
                  : "chevron"
              }
            />
          </button>

          {openDropdown === "mobile-resources" && (
            <div className="mobile-dropdown-links">

              <Link to="/blog" onClick={closeMenu}>
                Blog
              </Link>

              <Link to="/tutorials" onClick={closeMenu}>
                Tutorials
              </Link>

              <Link
                to="/documentation"
                onClick={closeMenu}
              >
                Documentation
              </Link>

              <Link to="/faq" onClick={closeMenu}>
                FAQ
              </Link>

              <Link
                to="/case-studies"
                onClick={closeMenu}
              >
                Case Studies
              </Link>

              <Link
                to="/help-center"
                onClick={closeMenu}
              >
                Help Center
              </Link>

            </div>
          )}

        </div>

        <Link to="/contact" onClick={closeMenu}>
          Contact
        </Link>

        <hr />

        <button
          className="signin-btn"
          onClick={handleTutorialClick}
        >
          Tutorial
        </button>

        <button
          className="signin-btn"
          onClick={handleSigninClick}
        >
          Sign In
        </button>

        <button
          className="signup-btn"
          onClick={handleSignupClick}
        >
          Sign Up
        </button>

      </div>
    </>
  );
};

export default Navbar;