import React from 'react'
import { useState } from 'react'
import '../Page_styles/Sectionone.css'
import CircularPieChart from './PieChart'
const Sectionone = () => {
  const [totalStorage, setTotalStorage] = useState(1000);  // Example total storage
  const [filledStorage, setFilledStorage] = useState(600);  // Example filled storage
  return (
    <div className='main-section'>
      <div className='first-section'>
        
      </div>
      <div className='second-section'>
        <CircularPieChart totalStorage={totalStorage} filledStorage={filledStorage}/>
      </div>
    </div>
  )
}

export default Sectionone

