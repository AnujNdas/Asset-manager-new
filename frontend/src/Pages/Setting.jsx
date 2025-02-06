import React from 'react'
import "../Page_styles/Setting.css"
import { Link, Route, Routes , Navigate , useNavigate} from 'react-router-dom'
import MyProfile from '../Inner_sections/MyProfile'
import Security from '../Inner_sections/Security'
import {useState , useEffect } from 'react'

const Setting = () => {
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();
  
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      // Reset the userData state as well
      setUserData(null);
      // Redirect to the login page
      navigate("/User/Login");
    };

    useEffect(() => {
      const fetchUserData = async () => {
        const token = localStorage.getItem("token");
  
        if (!token) {
          Swal.fire({
            title: "Login Required",
            text: "Please log in.",
            icon: "warning",
            confirmButtonText: "OK"
          }).then(() => {
            navigate("/User/Login"); // Redirect to login page after user clicks "OK"
          });
          return; // Exit early if no token is found
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
    <div className='setting-container'>
      <div className="heading">
        <h3>Account Settings</h3>
      </div>
      <div className="setting-box">
        <div className="setting-menu">
            <div className="setting-pages">
                <Link to="/Setting/Profile">My Profile</Link>
                <Link to="/Setting/Security">Security</Link>
                <Link to="/Setting/General">General</Link>
                <Link to="/Setting/TeamMember">Team Member</Link>
                <Link to="/Setting/Notification">Notification</Link>
                <button className='log-btn' onClick={handleLogout}>Logout</button>
            </div>
        </div>
        <div className="settings">
          <Routes>
             {/* Default route to Profile */}
            <Route path="/" element={<Navigate to="profile" />} />

            <Route path='Profile' element={<MyProfile/>}/>
            <Route path='Security' element={<Security/>}/>
            {/* <Route path='General' element={<MyProfile/>}/> */}
            {/* <Route path='TeamMember' element={<MyProfile/>}/> */}
            {/* <Route path='Notification' element={<MyProfile/>}/> */}
            {/* <Route path='Logout' element={<MyProfile/>}/> */}
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default Setting
