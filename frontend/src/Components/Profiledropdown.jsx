import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faInbox, faMoon } from '@fortawesome/free-solid-svg-icons';
import '../Page_styles/Profiledropdown.css';
import { Link } from 'react-router-dom';

const ProfileDropdown = ({ isVisible, onClose ,toggleButtonRef }) => {
  const dropdownRef = useRef(null);

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
    <div ref={dropdownRef} className={`profile-dropdown-container ${isVisible ? 'show' : ''}`}>
      <div className={`dropdown-menu ${isVisible ? 'show' : ''}`}>
        <ul className='drop-box'>
          <li><Link to="/user/login"><FontAwesomeIcon icon={faUser} /> User</Link></li>
          <li><Link to="/setting/notification"><FontAwesomeIcon icon={faInbox} /> Inbox</Link></li>
          <li><Link to="/mode"><FontAwesomeIcon icon={faMoon} /> Mode</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileDropdown;




