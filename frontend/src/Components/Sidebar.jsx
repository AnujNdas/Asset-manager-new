import React ,{ useContext} from 'react'
import '../Component_styles/Sidebar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import image from "../Images/logo.png"
import  ThemeContext  from '../Context/ThemeContext'
import { faGauge ,faLayerGroup ,faCartShopping , faMoon ,faSun, faGear, faReceipt, faRecycle} from '@fortawesome/free-solid-svg-icons'
// import { useContext } from 'react'

const Sidebar = ({closeSidebar})=> {
    const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div className={`sidebar-container ${theme}`}>
      <div className={`sidebar ${theme}`}>
        <div className='sidebar-heading'>
          <div className="logo">
            <img src={image} style={{
              height : "100%",
              width: "100%"
            }}/>
          </div>
          <div className="title">
            <h1>ASSERA</h1>
          </div>
        </div>
        <div className='sidebar-menu'>
          <ul>
            <li><Link to="/" onClick={closeSidebar}><FontAwesomeIcon icon={faGauge} style={{ width : "25%"}}/><span className="tab-text">Dashboard</span></Link></li>
            <li><Link to="/assetCapture" onClick={closeSidebar}><FontAwesomeIcon icon={faCartShopping} style={{ width : "25%"}}/><span className="tab-text">Asset capture</span></Link></li>
            {/* <li><Link to="/Product_list"><FontAwesomeIcon icon={faList} />Product List</Link></li> */}
            <li><Link to="/inventory" onClick={closeSidebar}><FontAwesomeIcon icon={faLayerGroup} style={{ width : "25%"}}/><span className="tab-text">Inventory</span></Link></li>
            <li><Link to="/misReport" onClick={closeSidebar}><FontAwesomeIcon icon={faReceipt} style={{ width : "25%"}}/><span className="tab-text">MIS Report</span></Link></li>
            <li><Link to="/setting" onClick={closeSidebar}><FontAwesomeIcon icon={faGear} style={{ width : "25%"}}/><span className="tab-text">Settings</span></Link></li>
            <li><Link to="/classification" onClick={closeSidebar}><FontAwesomeIcon icon={faRecycle} style={{ width : "25%"}}/><span className="tab-text">Classifications</span></Link></li>
          </ul>
        </div>
        {/* ✅ Dark/Light Toggle at Bottom */}
        <div className="sidebar-toggle">
          <button onClick={toggleTheme}>
            <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} /> 
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

