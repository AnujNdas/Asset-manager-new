import React ,{ useState } from 'react'
import '../Page_styles/Login.css'
import { Link , useNavigate } from 'react-router-dom'
import image from '../Images/rb_1365.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook ,faTwitter,faLinkedin, faGithub} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'
import AuthService from '../Services/AuthService'

const Login = ({ setProfileUser}) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // useHistory() if using React Router v5

   // Focus states for both inputs
   const [usernameFocus, setUsernameFocus] = useState(false);
   const [passwordFocus, setPasswordFocus] = useState(false);
 
   // Handlers for focus/blur events
   const handleUsernameFocus = () => setUsernameFocus(true);
   const handleUsernameBlur = () => setUsernameFocus(false);
 
   const handlePasswordFocus = () => setPasswordFocus(true);
   const handlePasswordBlur = () => setPasswordFocus(false);

   const handlelogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await AuthService.login(username, password);
      console.log("Login successful:", response);  // Log the success message to make sure login is successful
      
      // Ensure the response contains token
      if (response && response.token) {
        localStorage.setItem("token", response.token); // Store token in local storage
        localStorage.setItem("username", username);   // Store username in local storage
        // setProfileUser(username);  // Update the profile user state
        alert("Login Successful!"); // Show success message
        navigate("/");  // Redirect to the homepage or desired page
      } else {
        // If there's an unexpected structure of response (i.e., no token)
        console.error("Unexpected response format:", response);
        alert("Unexpected response format. Please try again.");
      }
  
      setLoading(false);
    } catch (error) {
      setLoading(false);
  
      // Log the full error details
      console.error("Full error:", error);  // This will log the error to console
      
      if (error.response) {
        // Handle the case where the server responded with an error
        console.error("Error Response:", error.response);
        alert(error.response.data.error || "Login failed due to server error.");
      } else if (error.request) {
        // Handle the case where the request was made but no response was received
        console.error("Error Request:", error.request);
        alert("No response from the server. Please check your internet connection.");
      } else {
        // Handle any other error
        console.error("Error Message:", error.message);
        alert("An error occurred. Please try again.");
      }
    }
  };
  
  

  // const navigate = useNavigate();
  return (
    <div className='login-container'>
      <form action="" className='Login-form' onSubmit={handlelogin}>
        <div className="auth-logo">
          <img src={image} alt="" height={120}/>
        </div>
        <h2>Login</h2>
        <div className="social">
        <FontAwesomeIcon icon={faFacebook} />
        <FontAwesomeIcon icon={faTwitter} />
        <FontAwesomeIcon icon={faLinkedin} />
        <FontAwesomeIcon icon={faGithub} />
        </div>
        <div className="input-box">
          <input 
          type='text'
          id='user-input'
          value={username}
          onFocus={handleUsernameFocus}
          onBlur={handleUsernameBlur}
          onChange={(e) => setUsername(e.target.value)}
          placeholder=''
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
        
        <div className="button-panel">
            <Link to={'/forget'} className='foet'>Forget Password</Link>
            <button type='submit' className='submit-btn'>
            {loading ? 'Logging in...' : 'Login'}
            </button>
        </div>
      </form>
    </div>
  )
}

export default Login
