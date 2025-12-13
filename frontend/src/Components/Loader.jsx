import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Loader = ({ type = "default", apiDone = false }) => {
  const messageSets = {
    login: [
      "Verifying credentials…",
      "Checking user access…",
      "Setting up your workspace…",
      "Almost logged in…",
    ],
    default: ["Loading…", "Please wait…", "Almost there…"],
  };

  const messages = messageSets[type] || messageSets.default;

  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (apiDone) {
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setProgress((p) => (p >= 95 ? p : p + Math.floor(Math.random() * 3 + 1)));
    }, 350);

    return () => clearInterval(interval);
  }, [apiDone]);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 1500);

    return () => clearInterval(msgInterval);
  }, [messages.length]);

  return (
    <div style={styles.container}>
      {/* Outer rotating ring */}
      <motion.div
        style={styles.outerRing}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner progress circle */}
      <div style={styles.innerCircle}>
        <motion.div
          style={{
            ...styles.liquid,
            height: `${progress}%`,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        <span style={styles.percent}>{progress}%</span>
      </div>

      <motion.p
        key={index}
        style={styles.text}
        initial={{ opacity: 0, y: 6 }}
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
  },

  outerRing: {
    position: "absolute",
    height: "96px",
    width: "96px",
    borderRadius: "50%",
    border: "3px solid rgba(124,58,237,0.25)",
    borderTopColor: "#7B5DFF",
  },

  innerCircle: {
    height: "80px",
    width: "80px",
    borderRadius: "50%",
    background: "#0f172a",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  liquid: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    background: "linear-gradient(180deg, #7B5DFF, #6D28D9)",
    borderRadius: "0 0 50% 50%",
  },

  percent: {
    position: "relative",
    zIndex: 2,
    color: "#fff",
    fontWeight: 600,
    fontSize: "18px",
  },

  text: {
    color: "#6B7280",
    fontSize: "15px",
    fontWeight: 500,
  },
};

export default Loader;
