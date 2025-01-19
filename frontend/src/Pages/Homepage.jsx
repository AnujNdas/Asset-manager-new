import React from 'react'
import { useState } from 'react'
import Sidebar from '../Components/Sidebar'
import Menubar from '../Components/Menubar'
import Dropdown from '../Components/Dropdown'

const Homepage = () => {
    const [selectedOption, setSelectedOption] = useState("Guest");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  // Handle when a dropdown item is clicked
  const handleItemClick = (item) => {
    setSelectedOption(item);  // Set selected option
    setIsDropdownOpen(false);  // Hide dropdown after selection
  };
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  return (
    <div>
      <section className="first-container">
        <Sidebar />
      </section>
      <section className="second-container">
        {/* Pass the buttonRef and toggle function to Menubar */}
        <Menubar onButtonClick={toggleDropdown} selectedOption={selectedOption}/>
        {/* Only render the dropdown if it's open */}
        <Dropdown isOpen={isDropdownOpen} handleItemClick={handleItemClick}/>
      </section>
    </div>
  )
}

export default Homepage
