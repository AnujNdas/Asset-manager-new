import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.text}>{text}</p>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #7B5DFF",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  text: {
    fontSize: "14px",
    color: "#6B7280",
  },
};

export default Loader;