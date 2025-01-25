import React from 'react'
import { Link, Route, Routes , Navigate} from 'react-router-dom'
import '../Page_styles/Classification.css'
import Unit from '../Inner_sections/Unit'
import Category from '../Inner_sections/Category'
import Location from '../Inner_sections/Location'
import Status from '../Inner_sections/Status'
const Classification = () => {
  return (
    <div className='classification_container'>
        <div className="classify_heading">
            Classification
        </div>
        <div className="classification_inner">
            <div className="classify_menu">
                <div className="menu_div">
                    <Link to="/classification/location">Location</Link>
                    <Link to="/classification/unit">Unit</Link>
                    <Link to="/classification/category">Category</Link>
                    <Link to="/category">Category</Link>
                </div>
            </div>
            <div className="classify_items">
                <div className="classify_content">
                    <Routes>
                        <Route path="/" element={<Navigate to="Location" />} />
                        <Route exact path='/unit' element={<Unit/>} />
                        <Route exact path='/category' element={<Category/>} />
                        <Route exact path='/location' element={<Location/>} />
                        <Route exact path='/status' element={<Status/>} />
                    </Routes>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Classification

