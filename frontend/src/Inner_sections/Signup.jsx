import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'
import image from '../Images/logo.png'
import { faFacebook ,faTwitter,faLinkedin, faGithub} from '@fortawesome/free-brands-svg-icons';
import AuthService from '../Services/AuthService'
import Swal from 'sweetalert2';
const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

     // Focus states for both inputs
     const [nameFocus, setNameFocus] = useState(false)
     const [usernameFocus, setUsernameFocus] = useState(false);
     const [passwordFocus, setPasswordFocus] = useState(false);
   
     // Handlers for focus/blur events
     const handleUsernameFocus = () => setUsernameFocus(true);
     const handleUsernameBlur = () => setUsernameFocus(false);

     const handlenameFocus = () => setNameFocus(true);
     const handlenameBlur = () => setNameFocus(false);
   
     const handlePasswordFocus = () => setPasswordFocus(true);
     const handlePasswordBlur = () => setPasswordFocus(false);

  const handlesignup = async (e) => {
    e.preventDefault();
    try { 
      const response = await AuthService.signup ( name ,username,password);
      Swal.fire({
        title: "Notification",
        text: response.message,
        icon: "success", // You can change the icon depending on the context (e.g., "info", "success", "warning")
        confirmButtonText: "OK"
      });

    }
    catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Sign up failed",
        icon: "error",
        confirmButtonText: "OK"
      });

    }
  };
  return (
    <div className='login-container'>
          <form action="" className='Login-form' onSubmit={handlesignup}>
            <div className="auth-logo">
              <img src={image} alt="" style={{
                height : "100%",
                width : "50%"
              }}/>
            </div>
            <h2>SignUp</h2>
            <div className="social">
              <FontAwesomeIcon icon={faFacebook} />
              <FontAwesomeIcon icon={faTwitter} />
              <FontAwesomeIcon icon={faLinkedin} />
              <FontAwesomeIcon icon={faGithub} />
            </div>
            <div className="input-box">
              <input
              id='name-input'
              type='text'
              value={name}
              onFocus={handlenameFocus}
              onBlur={handlenameBlur}
              onChange={(e) => setName(e.target.value)}
              required
              />
              {(!nameFocus && name  === '') && (
                <label htmlFor="name-input" className="input-label">
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                  Full Name
                </label>
              )}
            </div>
           <div className="input-box">
            <input 
              type='text'
              id='user-input'
              value={username}
              onFocus={handleUsernameFocus}
              onBlur={handleUsernameBlur}
              onChange={(e) => setUsername(e.target.value)}
              required
              />
              {(!usernameFocus && username === '') && (
                <label htmlFor="username-input" className="input-label">
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                  Username
                </label>
              )}
           </div>
            
            <div className="input-box">
              <input 
              type='password'
              id='password-input'
              value={password}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              onChange={(e) => setPassword(e.target.value)}
              required
              />
              {(!passwordFocus && password === '') && (
                  <label htmlFor="password-input" className="input-label">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    Password
                  </label>
                )}
            </div>
                <button type='submit' className='sign-btn'>SignUp</button>
          </form>
          {message && <p>{message}</p>}
        </div>
  )
}

export default Signup
