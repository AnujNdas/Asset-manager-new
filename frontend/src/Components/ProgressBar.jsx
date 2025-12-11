import React, { createContext, useContext, useState } from "react";
import "../Component_styles/ProgressBar.css";
import { registerProgressController } from "./ProgressController";

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(0);

  const startProgress = () => {
    setLoading(true);
    setWidth(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress < 90) {
        setWidth(progress);
      } else {
        clearInterval(interval);
      }
    }, 200);
  };

  const stopProgress = () => {
    setWidth(100);
    setTimeout(() => {
      setLoading(false);
      setWidth(0);
    }, 300);
  };

  useEffect(() => {
    registerProgressController(startProgress, stopProgress);
  }, []);

  return (
    <>
      {loading && (
        <div className="progress-bar-wrapper">
          <div className="progress-bar" style={{ width: `${width}%` }}></div>
        </div>
      )}
      {children}
    </>
  );
};

