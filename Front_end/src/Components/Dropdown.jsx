import React from 'react';
import '../Component_styles/Dropdown.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserClock , faUserTag , faUserPen , faRightFromBracket} from '@fortawesome/free-solid-svg-icons'

const Dropdown = ({ isOpen , handleItemClick }) => {
  const handleLinkClick = (event, item) => {
    event.preventDefault();  // Prevent the default behavior of <a> tag
    handleItemClick(item);  // Call the passed down handler to update the button text
  };
    return (
    <div
      className="dropdown"
    >
      {isOpen && (
        <div className="dropdown-content">
          <a href="/" onClick={(event) => handleLinkClick(event, "Employee")}><FontAwesomeIcon icon={faUserClock} /> Employee</a>
          <a href="/" onClick={(event) => handleLinkClick(event, "Supervisor")}> <FontAwesomeIcon icon={faUserTag} />Supervisor</a>
          <a href="/" onClick={(event) => handleLinkClick(event, "Personal")}> <FontAwesomeIcon icon={faUserPen} /> Personal</a>
          <a href="/" onClick={(event) => handleLinkClick(event, "Logout")}> <FontAwesomeIcon icon={faRightFromBracket} /> Logout</a>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
