import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    // No token → redirect to login
    return <Navigate to="/User/Login" replace/>;
  }

  return children; // Token exists → allow access
};

export default ProtectedRoute;
