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
    signup: [
      "Creating your account…",
      "Saving your details…",
      "Initializing profile settings…",
      "Finalizing signup…",
    ],
    dashboard: [
      "Loading dashboard…",
      "Fetching business insights…",
      "Preparing widgets…",
      "Almost ready…",
    ],
    inventory: [
      "Loading inventory…",
      "Fetching product list…",
      "Syncing stock levels…",
      "Preparing inventory view…",
    ],
    mis: [
      "Preparing MIS reports…",
      "Aggregating data…",
      "Generating insights…",
      "Finalizing report structure…",
    ],
    classification: [
      "Sorting items…",
      "Applying category rules…",
      "Filtering classifications…",
      "Almost done…",
    ],
    default: ["Loading…", "Please wait…", "Almost there…", "Preparing data…"],
  };

  const messages = messageSets[type] || messageSets.default;

  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(1);

  // Random simulated progress
  useEffect(() => {
    if (apiDone) {
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;

        const step = Math.floor(Math.random() * 4) + 1; // 1–4%
        let next = prev + step;

        if (next > 95) next = 95;
        return next;
      });
    }, 350);

    return () => clearInterval(interval);
  }, [apiDone]);

  // Cycle messages
  useEffect(() => {
    const msgInterval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    return () => clearInterval(msgInterval);
  }, [messages.length]);

  // Circular progress calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={styles.container}>
      {/* Rotating Outer Ring */}
      <motion.div
        style={styles.ring}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      >
        <div style={styles.innerRing}></div>

        {/* Circular Progress */}
        <svg width="70" height="70" style={styles.svg}>
          <circle
            cx="35"
            cy="35"
            r={radius}
            stroke="rgba(124, 58, 237, 0.2)"
            strokeWidth="5"
            fill="none"
          />
          <motion.circle
            cx="35"
            cy="35"
            r={radius}
            stroke="#7B5DFF"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* Animated Text */}
      <motion.p
        key={index}
        style={styles.text}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {progress}% – {messages[index]}
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
    gap: "18px",
    background: "transparent",
  },
  ring: {
    height: "90px",
    width: "90px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    border: "6px solid rgba(124, 58, 237, 0.25)",
    borderTopColor: "#7B5DFF",
    borderLeftColor: "#6D28D9",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    boxShadow: "0 0 25px rgba(123, 93, 255, 0.4)",
  },
  innerRing: {
    position: "absolute",
    inset: "12px",
    borderRadius: "50%",
    border: "4px solid rgba(124, 58, 237, 0.15)",
    borderTopColor: "transparent",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  text: {
    color: "#6B7280",
    fontSize: "16px",
    fontWeight: 500,
    letterSpacing: "0.3px",
    textAlign: "center",
  },
};

export default Loader;
