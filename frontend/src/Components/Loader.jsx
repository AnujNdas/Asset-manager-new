import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Loader = ({ type = "default" }) => {
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
    default: [
      "Loading…",
      "Please wait…",
      "Almost there…",
      "Preparing data…"
    ],
  };

  const messages = messageSets[type] || messageSets.default;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.ring}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      >
        <div style={styles.innerRing}></div>
      </motion.div>

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
    gap: "18px",
    background: "transparent",
  },
  ring: {
    height: "70px",
    width: "70px",
    borderRadius: "50%",
    border: "5px solid rgba(124, 58, 237, 0.25)",
    borderTopColor: "#7B5DFF",
    borderLeftColor: "#6D28D9",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    boxShadow: "0 0 25px rgba(123, 93, 255, 0.4)",
    position: "relative",
  },
  innerRing: {
    position: "absolute",
    inset: "10px",
    borderRadius: "50%",
    border: "3px solid rgba(124, 58, 237, 0.2)",
    borderTopColor: "transparent",
  },
  text: {
    color: "#6B7280",
    fontSize: "16px",
    fontWeight: 500,
    letterSpacing: "0.3px",
  },
};

export default Loader;
