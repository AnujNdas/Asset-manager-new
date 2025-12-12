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

  // Smart distribution of messages across progress milestones
  const milestones = [10, 25, 45, 70, 90];
  const distributedMessages = messages.slice(0, milestones.length);

  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(distributedMessages[0]);

  useEffect(() => {
    let msgIndex = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;

        // Update message when we cross a milestone
        if (msgIndex < milestones.length && next >= milestones[msgIndex]) {
          setCurrentMessage(distributedMessages[msgIndex]);
          msgIndex++;
        }

        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }

        return next;
      });
    }, 40); // speed of loading

    return () => clearInterval(interval);
  }, [distributedMessages]);

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
        style={styles.percent}
        key={progress}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {progress}%
      </motion.p>

      <motion.p
        key={currentMessage}
        style={styles.text}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {currentMessage}
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
    gap: "14px",
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
  percent: {
    color: "#7C3AED",
    fontSize: "20px",
    fontWeight: 700,
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
