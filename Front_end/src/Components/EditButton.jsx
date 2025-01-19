import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPenToSquare} from '@fortawesome/free-solid-svg-icons';
const EditButton = () => {
  return (
    <div className='edit-btn' style={{height : "35px",textAlign: "center" , width : '70px' , borderRadius : '20px', backgroundColor : "#f6f6f6", fontSize: "14px", display:"flex" , alignItems : "center" , justifyContent:"center", gap: '5px'}}>
      Edit <FontAwesomeIcon icon={faPenToSquare} />
    </div>
  )
}

export default EditButton
