import React from 'react'
import '../Component_styles/Sidebar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import image from "../Images/logo.png"
import { faGauge ,faLayerGroup ,faCartShopping , faWarehouse, faGear, faReceipt, faRecycle} from '@fortawesome/free-solid-svg-icons'

const Sidebar = ({closeSidebar})=> {
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
            <h1>Asset Manager</h1>
          </div>
        </div>
        <div className='sidebar-menu'>
          <ul>
            <li><Link to="/" onClick={closeSidebar}><FontAwesomeIcon icon={faGauge} style={{ width : "25%"}}/><span className="tab-text">Dashboard</span></Link></li>
            <li><Link to="/assetCapture" onClick={closeSidebar}><FontAwesomeIcon icon={faCartShopping} style={{ width : "25%"}}/><span className="tab-text">Asset capture</span></Link></li>
            {/* <li><Link to="/Product_list"><FontAwesomeIcon icon={faList} />Product List</Link></li> */}
            <li><Link to="/inventory" onClick={closeSidebar}><FontAwesomeIcon icon={faLayerGroup} style={{ width : "25%"}}/><span className="tab-text">Inventory</span></Link></li>
            <li><Link to="/misreport" onClick={closeSidebar}><FontAwesomeIcon icon={faReceipt} style={{ width : "25%"}}/><span className="tab-text">MIS Report</span></Link></li>
            <li><Link to="/setting" onClick={closeSidebar}><FontAwesomeIcon icon={faGear} style={{ width : "25%"}}/><span className="tab-text">Settings</span></Link></li>
            <li><Link to="/classification" onClick={closeSidebar}><FontAwesomeIcon icon={faRecycle} style={{ width : "25%"}}/><span className="tab-text">Classifications</span></Link></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

