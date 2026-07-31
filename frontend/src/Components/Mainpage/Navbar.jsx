import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleSigninClick = () => {
    navigate("/user/login");
    closeMenu();
  };

  const handleSignupClick = () => {
    navigate("/user/signup");
    closeMenu();
  };

  const handleTutorialClick = () => {
    window.open("https://youtu.be/M4L6AeK-ckY", "_blank");
    closeMenu();
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <Link to="/">
            <img
              src="/images/Logo2.png"
              alt="AssetPegasus Logo"
              height="150"
            />
          </Link>
        </div>

        <ul className="nav-menu">
          <li>
            <Link to="/">Home</Link>
          </li>

          <li>
            <Link to="/about">About</Link>
          </li>

          <li>
            <Link to="/contact">Contact</Link>
          </li>
          <li>
            <Link to="/terms">Terms & Condition</Link>
          </li>
        </ul>

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

        <button
          className="menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
        <Link to="/" onClick={closeMenu}>
          Home
        </Link>

        <Link to="/about" onClick={closeMenu}>
          About
        </Link>

        <Link to="/contact" onClick={closeMenu}>
          Contact
        </Link>
        <Link to="/terms" onClick={closeMenu}>
          Term & Condition
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