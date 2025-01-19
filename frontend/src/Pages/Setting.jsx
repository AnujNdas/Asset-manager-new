import React from 'react'
import "../Page_styles/Setting.css"
import { Link, Route, Routes , Navigate} from 'react-router-dom'
import MyProfile from '../Inner_sections/MyProfile'
import Security from '../Inner_sections/Security'

const Setting = () => {
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
                <Link to="/Setting/Logout" className='logout'>Logout</Link>
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
