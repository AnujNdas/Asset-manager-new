import React, { useState, useEffect } from 'react';
import EditButton from '../Components/EditButton';
import '../Page_styles/MyProfile.css';
import { useNavigate } from 'react-router-dom';

const MyProfile = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please log in.");
        navigate("/User/Login"); // Redirect to login if no token is found
        return;
      }

      try {
        const response = await fetch("https://asset-manager-new.onrender.com/api/auth/user", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // Send token in the Authorization header
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data); // Set user data to state
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Error fetching user data. Please try again.");
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <div className="Profile-container">
      <div className="Profile-heading">
        <p>My Profile</p>
      </div>
      <div className="personal-Profile">
        <div className="boxes-1">
          <div className="profile-img"></div>
          <div className="data-info">
            {/* Conditionally render username only if userData is not null */}
            <div className="p-name" style={{ fontWeight: '600', color: '#565656', fontFamily: 'Montserrat,san-serif' }}>
              {userData ? userData.username : 'Loading...'}
            </div>
            <div className="role" style={{ fontSize: '13px', fontWeight: '500', color: '#565656' }}>
              Architect
            </div>
            <div className="location" style={{ fontSize: '13px', fontWeight: '500', color: '#565656' }}>
              India
            </div>
          </div>
        </div>
        <div className="button-ed">
          <EditButton />
        </div>
      </div>
      <div className="personal-data">
        <div className="head-box">
          <div className="title-p">Personal Information</div>
          <div className="button-ed">
            <EditButton />
          </div>
        </div>
        <div className="boxes">
          <div className="one">
            <p>First Name</p>
            <h5>{userData ? userData.name : 'Loading...'}</h5>
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
            <EditButton />
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
  );
};

export default MyProfile;
