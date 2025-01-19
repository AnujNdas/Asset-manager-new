import React  from "react";
import { useState } from "react";
import '../Page_styles/User.css'
import { useNavigate } from "react-router-dom";
import Login from "../Inner_sections/Login";
import Signup from "../Inner_sections/Signup";


const User = ({ removeUser }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [isSignup, setIsSignup] = useState(false)

  const navigate= useNavigate();

  const navigateToLogin = () =>{
    setIsLogin(true)
    setIsSignup(false)
    navigate('/User/Login')
  }
  const navigateToSignup = () =>{
    setIsLogin(false)
    setIsSignup(true)
    navigate('/User/Signup')
  }
  const goBackToHomepage = () => {
    navigate('/', {replace : true})
    removeUser()
  }
  return (
      <div className="login-overlay">
        <div className="login-content">
          <button onClick={goBackToHomepage} className="back-btn">Back to Homepage</button>
          <div className="change-panel">
            <div className="menus">
              <button
               onClick={navigateToLogin} 
               className="menu-btn" 
               style={{
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: isLogin ? 'white' : 'transparent', // Solid color when active
                color: isLogin ? '#ff2270' : 'white', // Change text color when active
                // border: '1px solid #ccc', // Optional border for visibility
                // padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 'bold',
                textAlign: 'center',
                cursor: 'pointer',
                // textTransform: 'uppercase',
                outline: 'none',
                boxShadow: '2px 2px 7px rgba(0,0,0,0.2)',
                transition: 'color 0.7s ease',
                // Apply animation only when the state changes to active
                animation: isLogin ? 'fillFromRightToLeft 0.7s forwards' : 'none',
              }}
               >
                Login
                </button>
              <button 
              onClick={navigateToSignup} 
              className="menu-btn" 
              style={{
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: isSignup ? 'white' : 'transparent', // Solid color when active
                color: isSignup ? '#ff2270' : 'white', // Change text color when active
                // border: '1px solid #ccc', // Optional border for visibility
                // padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 'bold',
                textAlign: 'center',
                cursor: 'pointer',
                // textTransform: 'uppercase',
                outline: 'none',
                boxShadow: '2px 2px 7px rgba(0,0,0,0.2)',
                transition: 'color 0.7s ease',
                // Apply animation only when the state changes to active
                animation: isSignup ? 'fillFromRightToLeft 0.7s forwards' : 'none',
              }}
              >
                Signup
                </button>
            </div>
          </div>
            <div className="auth-pages">
              {isLogin ? <Login/> : <Signup/>}
            </div>
        </div>
      </div>
  );
};

export default User;
