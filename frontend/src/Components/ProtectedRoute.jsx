// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const authRaw = localStorage.getItem("auth");

  if (!authRaw) {
    return <Navigate to="/user/login" replace />;
  }

  let auth;
  try {
    auth = JSON.parse(authRaw);
  } catch {
    localStorage.clear();
    return <Navigate to="/user/login" replace />;
  }

  const token = auth.token;
  if (!token) {
    return <Navigate to="/user/login" replace />;
  }

  let decoded;
  try {
    decoded = jwtDecode(token);
  } catch {
    localStorage.clear();
    return <Navigate to="/user/login" replace />;
  }

  // Optional role-based access
  if (allowedRoles && !allowedRoles.includes(decoded.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
