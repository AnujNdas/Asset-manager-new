import React, { createContext, useContext, useRef } from "react";

const TourContext = createContext();

export const TourProvider = ({ children }) => {
  const tourRef = useRef(null);

  const registerTour = (tourInstance) => {
    tourRef.current = tourInstance;
  };

  const startTour = () => {
    if (tourRef.current) {
      tourRef.current.drive();
    }
  };

  return (
    <TourContext.Provider
      value={{
        registerTour,
        startTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);