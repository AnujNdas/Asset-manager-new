import React from 'react'
import '../Component_styles/Sidebar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import image from "../Images/logo.png"
import { faGauge ,faLayerGroup ,faCartShopping , faWarehouse, faGear, faReceipt, faRecycle} from '@fortawesome/free-solid-svg-icons'

const Sidebar = ()=> {
  return (
    <div className='sidebar-container'>
      <div className='sidebar'>
        <div className='sidebar-heading'>
          <div className="logo">
            <img src={image} style={{
              height : "100%",
              width: "100%"
            }}/>
          </div>
          <div className="title">
            <h1>Asset manager</h1>
          </div>
        </div>
        <div className='sidebar-menu'>
          <ul>
            <li><Link to="/"><FontAwesomeIcon icon={faGauge} style={{ width : "25%"}}/>Dashboard</Link></li>
            <li><Link to="/AssetCapture"><FontAwesomeIcon icon={faCartShopping} style={{ width : "25%"}}/>Asset Capture</Link></li>
            {/* <li><Link to="/Product_list"><FontAwesomeIcon icon={faList} />Product List</Link></li> */}
            <li><Link to="/Inventory"><FontAwesomeIcon icon={faLayerGroup} style={{ width : "25%"}}/>Inventory</Link></li>
            <li><Link to="/MISReport"><FontAwesomeIcon icon={faReceipt} style={{ width : "25%"}}/>MIS Report</Link></li>
            <li><Link to="/Setting"><FontAwesomeIcon icon={faGear} style={{ width : "25%"}}/>Settings</Link></li>
            <li><Link to="/Classification"><FontAwesomeIcon icon={faRecycle} style={{ width : "25%"}}/>Classification</Link></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

