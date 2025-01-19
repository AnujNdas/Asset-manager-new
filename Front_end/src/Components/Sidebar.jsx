import React from 'react'
import '../Component_styles/Sidebar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { faGauge ,faLayerGroup ,faCartShopping , faWarehouse, faGear, faReceipt, faRecycle} from '@fortawesome/free-solid-svg-icons'

const Sidebar = ()=> {
  return (
    <div className='sidebar-container'>
      <div className='sidebar'>
        <div className='sidebar-heading'>
          <div className="logo">
            <FontAwesomeIcon icon={faWarehouse} fade />
          </div>
          <div className="title">
            <h1>Asset manager</h1>
          </div>
        </div>
        <div className='sidebar-menu'>
          <ul>
            <li><Link to="/"><FontAwesomeIcon icon={faGauge} />Dashboard</Link></li>
            <li><Link to="/AssetCapture"><FontAwesomeIcon icon={faCartShopping} />Asset Capture</Link></li>
            {/* <li><Link to="/Product_list"><FontAwesomeIcon icon={faList} />Product List</Link></li> */}
            <li><Link to="/Inventory"><FontAwesomeIcon icon={faLayerGroup} />Inventory</Link></li>
            <li><Link to="/MISReport"><FontAwesomeIcon icon={faReceipt} />MIS Report</Link></li>
            <li><Link to="/Setting"><FontAwesomeIcon icon={faGear} />Settings</Link></li>
            <li><Link to="/Classification"><FontAwesomeIcon icon={faRecycle} />Classification</Link></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

