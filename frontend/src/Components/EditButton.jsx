import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

const EditButton = ({
  text = "Edit",
  icon = faPenToSquare,
  onClick,
  backgroundColor = "#f6f6f6",
  color = "#333",
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        height: "35px",
        width: "80px",
        borderRadius: "20px",
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
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#eaeaea")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = backgroundColor)}
    >
      {text} <FontAwesomeIcon icon={icon} />
    </button>
  );
};

export default EditButton;
