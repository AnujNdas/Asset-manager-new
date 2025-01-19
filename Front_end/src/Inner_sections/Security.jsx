import React from 'react'
import "../Page_styles/Security.css"

const Security = () => {
  return (
    <div className='Security-container'>
      <div className="Profile-heading">Security</div>
      <div className="change-password">
        <div className="box-head">
          <div className="title-p">
            Change Password
          </div>
        </div>
          <div className="input-container">
            <p> Old Password :- </p>
            <input
             type="password"
             placeholder='Current Password' />
          </div>
          <div className="input-container2">
            <p> New Password :- </p>
            <input
             type="password"
             placeholder='Current Password' />
          </div>
          <div className="change-button">
            <button type="submit">Change</button>
          </div>
      </div>
      <div className="two-factor-auth">
        <div className="box-head">
            <div className="title-p">
              Two Factor Authentication
            </div>
          </div>
          <div className="switch-container">
              <div className="info-switch">
                <p> Two-Factor Authentication enhances security with an extra verification.</p>
              </div>
              <div className="switch">
                <div class="form-check form-switch">
                    <label class="form-check-label" for="flexSwitchCheckDefault"></label>
                    <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault"/>
                  </div>
              </div>
          </div>
    
          <div className="input-container">
            <p> Enter Verification Code (Via Gmail) :-</p>
            <input
             type="text"
             placeholder='Verification Code' />
          </div>
          <div className="change-button">
            <button type="submit">Confirm</button>
          </div>
      </div>
      <div className="login-activity">
        <div className="title-login">
          Login Activity
        </div>
        <div className="login-device">
          <div className="device-logo"></div>
          <div className="device-data">
            <h4> Windows</h4>
            <p> Last active today at 12:34pm </p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Security
