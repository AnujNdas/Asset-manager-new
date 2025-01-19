import React from 'react'
import EditButton from '../Components/EditButton'
import '../Page_styles/MyProfile.css'

const MyProfile = () => {
  return (
    <div className='Profile-container' >
      <div className="Profile-heading">
        My Profile
      </div>
      <div className="personal-Profile">
        <div className="boxes-1">
            <div className="profile-img"></div>
            <div className="data-info">
                <div className="p-name" style={{fontWeight : "600", color: "#565656", fontFamily: "Montserrat,san-serif"}}>Anonymous</div>
                <div className="role" style={{ fontSize : '13px', fontWeight : "500", color : '#565656'}}>Architect</div>
                <div className="location" style={{fontSize : '13px', fontWeight : "500", color : '#565656'}}>India</div>
            </div>
        </div>
        <div className="button-ed">
            <EditButton/>
        </div>
      </div>
      <div className="personal-data">
        <div className="head-box">
            <div className="title-p">Personal Information</div>
            <div className="button-ed">
                <EditButton/>
            </div>
        </div> 
        <div className="boxes">
            <div className="one">
                <p>First Name</p>
                <h5>Anonymous</h5>
            </div>
            <div className="two">
                <p>Bio</p>
                <h5>Team Member</h5>
            </div>
            <div className="three">
                <p>E mail</p>
                <h5>Anonymous@gmail.com</h5>
            </div>
            <div className="four">
                <p>Ph no</p>
                <h5>1234565789</h5>
            </div>
        </div>
        
      </div>
      <div className="address">
        <div className="head-box">
            <div className="title-p">Address</div>
            <div className="button-ed">
                <EditButton/>
            </div>
        </div> 
        <div className="boxes">
            <div className="one">
                <p>Country</p>
                <h5>India</h5>
            </div>   
            <div className="two">
                <p>City/State</p>
                <h5>JSR/India</h5>
            </div>
            <div className="three">
                <p>Postal-Code</p>
                <h5>831001</h5>
            </div>
            <div className="four">
                <p>Tax-Id</p>
                <h5>sh78d78e</h5>
            </div>
        </div>
      </div>
    </div>
  )
}

export default MyProfile
