import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

const EditButton = ({
  text = "Edit",
  icon = faPenToSquare,
  onClick,
  backgroundColor = "#4a90e2",
  color = "#ffffffff",
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        height: "35px",
        fontWeight : 500,
        width: "80px",
        borderRadius: "5px",
        backgroundColor,
        color,
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        border: "none",
        cursor: "pointer",
        transition: "background 0.3s ease",
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#3668a4ff")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = backgroundColor)}
    >
      {text} <FontAwesomeIcon icon={icon} />
    </button>
  );
};

export default EditButton;
