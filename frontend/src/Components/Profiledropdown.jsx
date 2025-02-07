import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faInbox, faMoon } from '@fortawesome/free-solid-svg-icons';
import '../Page_styles/Profiledropdown.css';
import { Link } from 'react-router-dom';

const ProfileDropdown = ({ isVisible }) => {
  return (
    <div className={`profile-dropdown-container ${isVisible ? 'show' : ''}`}>
      <div className={`dropdown-menu ${isVisible ? 'show' : ''}`}>
        <ul>
          <li><Link to="/User/Login"><FontAwesomeIcon icon={faUser} /> User</Link></li>
          <li><Link to="/Setting/Notification"><FontAwesomeIcon icon={faInbox} /> Inbox</Link></li>
          <li><Link to="/mode"><FontAwesomeIcon icon={faMoon} /> Mode</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileDropdown;

