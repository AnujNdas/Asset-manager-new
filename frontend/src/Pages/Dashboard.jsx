import React from 'react'
import '../Page_styles/Dashboard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot,faList,faChartSimple,faEnvelopesBulk} from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  return (
    <div className='dashboard-section'>
      <div className="classify_heading">
        Assets Overview
      </div>
      <div className='card-section'>
        <div className="card" >
          <div className="card-info" style={{
          backgroundColor : "#3f4045"
        }}>
          <FontAwesomeIcon icon={faChartSimple} style={{
            color : "white",
            fontSize : "20px",
            border: "none",
            textAlign: "center",
            textShadow: "2px 2px 8px rgba(0, 0, 0, 0.6)"
          }}/>
          </div>
        </div>
        <div className="card" >
          <div className="card-info" style={{
          backgroundColor : "#3d97ef"
        }}>
          <FontAwesomeIcon icon={faEnvelopesBulk} style={{
            color : "white",
            fontSize : "20px",
            border: "none",
            textAlign: "center",
            textShadow : "0px 0px 5px 15px rgba(0,0,0,0.5)"
          }}/>
          </div>
        </div>
        <div className="card" >
          <div className="card-info" style={{
          backgroundColor : "#5cb762"
        }}>
          <FontAwesomeIcon icon={faList} style={{
            color : "white",
            fontSize : "20px",
            border: "none",
            textAlign: "center",
            textShadow : "0px 0px 5px 15px rgba(0,0,0,0.5)"
          }}/>
          </div>
        </div>
        <div className="card" >
          <div className="card-info" style={{
          backgroundColor : "orange"
        }}>
          <FontAwesomeIcon icon={faLocationDot} style={{
            color : "white",
            fontSize : "20px",
            border: "none",
            textAlign: "center",
            textShadow : "0px 0px 5px 15px rgba(0,0,0,0.5)"
          }}/>
          </div>
        </div>
      </div>
      <div className="graph-section">
        <div className="graph">
          <div className="graph-info" style={{
            backgroundColor : "#3f4045"
          }}></div>
        </div>
        <div className="graph">
          <div className="graph-info" style={{
            backgroundColor : "#3d97ef"
          }}></div>
        </div>
        <div className="graph">
          <div className="graph-info" style={{
            backgroundColor : "#5cb762"
          }}></div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
