import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const authRaw = localStorage.getItem("auth");

  if (!authRaw) {
    return <Navigate to="/user/login" replace />;
  }

  try {
    const auth = JSON.parse(authRaw);
    const token = auth?.token;

    if (!token) {
      localStorage.clear();
      return <Navigate to="/user/login" replace />;
    }

    const decoded = jwtDecode(token);

    // ✅ CHECK TOKEN EXPIRATION
    const currentTime = Date.now() / 1000; // convert to seconds

    if (decoded.exp && decoded.exp < currentTime) {
      console.log("Token expired");

      localStorage.removeItem("auth");

      return (
        <Navigate
          to="/user/login"
          state={{ message: "Session expired. Please login again." }}
          replace
        />
      );
    }

    // ✅ ROLE VALIDATION (Only after expiration check)
// ✅ ROLE VALIDATION
if (allowedRoles && !allowedRoles.includes(decoded.role)) {

  setTimeout(() => {
    import("../utils/swalTheme").then(({ default: ThemeSwal }) => {
      ThemeSwal.fire({
        icon: "error",
        title: "Access Denied",
        text: `Your role (${decoded.role}) is not allowed to access this page.`,
        confirmButtonText: "Okay",
        customClass: {
          confirmButton: "my-confirm-btn",
        },
      });
    });
  }, 100);

  return <Navigate to="/" replace />;
}

    return <Outlet />;
  } catch (error) {
    console.log("Invalid token", error);
    localStorage.clear();
    return <Navigate to="/user/login" replace />;
  }
};

export default ProtectedRoute;