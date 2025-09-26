import React, { useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faInbox, faSignOut } from '@fortawesome/free-solid-svg-icons';
import '../Page_styles/Profiledropdown.css';
import { Link, useNavigate } from 'react-router-dom';

const ProfileDropdown = ({ isVisible, onClose, toggleButtonRef }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

    const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = sessionStorage.getItem('token');
        if (token) {
          sessionStorage.removeItem('token');
        }
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have been successfully logged out!',
          timer: 1500,
          showConfirmButton: false
        });
        navigate('/user/login');
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(event.target);
      const clickedOutsideToggleButton =
        toggleButtonRef.current && !toggleButtonRef.current.contains(event.target);

      if (clickedOutsideDropdown && clickedOutsideToggleButton) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose, toggleButtonRef]);

  return (
    <div
      ref={dropdownRef}
      className={`profile-dropdown-container ${isVisible ? 'show' : ''}`}
    >
      <div className={`dropdown-menu ${isVisible ? 'show' : ''}`}>
        <ul className="drop-box">
          <li>
            <button onClick={handleLogout} className="logout-btn">
              <FontAwesomeIcon icon={faSignOut} /> Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileDropdown;



