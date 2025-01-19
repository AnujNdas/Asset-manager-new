import React from 'react';
import '../Component_styles/Menubar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faBell, faCircleQuestion, faUser, faPlus, faClock, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Menubar = ({ username}) => {
  const navigate = useNavigate();

  // Function to trigger the login page navigation
  const buttonClick = () => {
    navigate('/User')
  };
  const buttonClick2 = () => {
    navigate('/Setting')
  };

  return (
    <div className='menubar-container'>
      <div className='menubar'>
        <div className='additional-button'>
          <div className="buttons-1">
            <FontAwesomeIcon icon={faPlus} />
          </div>
          <div className="buttons">
            <FontAwesomeIcon icon={faClock} />
          </div>
        </div>
        <div className='search-box'>
          <input type='text' placeholder='Search' />
          <button className='search-btn'>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>
        {/* <div className='profile-name'>
        {username ? (
          // If the user is logged in, show their username
          `Welcome, ${username}`
        ) : (
          // If no user is logged in, show a login prompt
          <span>Please log in</span>
        )}
        </div> */}
        <div className='control-panel'>
          <button className='controls'>
            <FontAwesomeIcon icon={faBell} style={{ color : "#002aff"}}/>
          </button>
          <button className='controls'>
            <FontAwesomeIcon icon={faCircleQuestion} style={{ color : "#002aff"}}/>
          </button>
          <button className='controls' onClick={buttonClick}>
            <FontAwesomeIcon icon={faUser} style={{ color : "#002aff"}}/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menubar;
