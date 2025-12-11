// src/Components/Loader.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Loader = () => {
  const messages = [
    "Loading…",
    "Please wait…",
    "Almost there…",
    "Preparing your dashboard…",
    "Fetching data…",
  ];

  const [index, setIndex] = useState(0);

  // Rotate messages every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.circle}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.p
        key={index}
        style={styles.text}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {messages[index]}
      </motion.p>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    background: "transparent",
  },

  circle: {
    height: "55px",
    width: "55px",
    background: "linear-gradient(135deg, #7B5DFF, #6D28D9)",
    borderRadius: "50%",
    boxShadow: "0 0 20px rgba(123, 93, 255, 0.6)",
  },

  text: {
    color: "#6B7280",
    fontSize: "15px",
    fontWeight: 500,
  },
};

export default Loader;
