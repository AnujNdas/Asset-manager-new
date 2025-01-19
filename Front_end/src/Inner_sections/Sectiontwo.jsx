import React from 'react'
import '../Page_styles/Sectiontwo.css'

const Sectiontwo = () => {
  return (
    <div className='main-section2'>
      <div className='inner-section1'>
        <div className='item-1'>
          <div className="section-heading">
            Product Details
          </div>
        </div>
        <div className='item-2'>
          <div className="section-heading">
            Top Selling Items
          </div>
          <div className="section-elements">
            <div className="element">
              
            </div>
            <div className="element">

            </div>
            <div className="element">

            </div>
          </div>
        </div>
      </div>
      <div className='inner-section2'>
        <div className='item-3'>
          <div className="section-heading">
            Purchase Order
          </div>
          <div className="section-list">
            <div className='list'>
              <div className="data">
                Quantity
              </div>
              <div className="numbers">
                2.00
              </div>
            </div>
            <div className='list'>
              <div className="data">
                Total Cost
              </div>
              <div className="numbers">
                Rs 46.00
              </div>
            </div>
          </div>
        </div>
        <div className='item-4'>
          <div className="section-heading">
            Sales Order
          </div>
          <div className="section-data">
            <div className="datas">
              <div className="head">Channel</div>
              <div className="numbers">1</div>
            </div>
            <div className="datas">
              <div className="head">Draft</div>
              <div className="numbers">0</div>
            </div>
            <div className="datas">
              <div className="head">Confirm</div>
              <div className="numbers">6</div>

            </div>
            <div className="datas">
              <div className="head">Packed</div>
              <div className="numbers">4</div>

            </div>
            <div className="datas">
              <div className="head">Shipped</div>
              <div className="numbers">20</div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default Sectiontwo
