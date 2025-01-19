import React from 'react'
import '../Page_styles/Dashboard.css'
import Sectionone from '../Inner_sections/Sectionone'
import Sectiontwo from '../Inner_sections/Sectiontwo'
import AssetDashboard from '../Inner_sections/AssetDashboard'
const Dashboard = () => {
  return (
    <div className='dashboard-section'>
      <AssetDashboard/>
      {/* <div className='section_1'>
        <Sectionone/>
      </div>
      <div className='section_2'>
        <Sectiontwo/>
      </div> */}
    </div>
  )
}

export default Dashboard
