// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ allowedRoles }) => {
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
    console.log("Decoded token:", decoded);
  } catch {
    localStorage.clear();
    return <Navigate to="/user/login" replace />;
  }

if (allowedRoles && !allowedRoles.includes(decoded.role)) {
  return (
    <Navigate
      to="/unauthorized"
      state={{
        message: `Your role (${decoded.role}) is not allowed to access this page.`,
      }}
      replace
    />
  );
}
  // ✅ THIS IS THE KEY LINE
  return <Outlet />;
};

export default ProtectedRoute;
