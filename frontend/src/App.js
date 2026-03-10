import { Routes, Route } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";

const TenantRoutes = lazy(() => import("./routes/TenantRoutes"));
const SuperAdminRoutes = lazy(() => import("./routes/SuperAdminRoutes"));

const User = lazy(() => import("./Pages/User"));
const Login = lazy(() => import("./Inner_sections/Login"));
const Signup = lazy(() => import("./Inner_sections/Signup"));
const ForgotPassword = lazy(() => import("./Inner_sections/ForgetPass"));
const ResetPassword = lazy(() => import("./Inner_sections/ResetPass"));
const Maintenance = lazy(() => import("./Pages/Maintainence"));
const Unauthorized = lazy(() => import("./Pages/Unauthorized"));

const App = () => {
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setProfileUser(storedUsername);
  }, []);

  if (process.env.REACT_APP_MAINTENANCE_MODE === "true") {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Maintenance />
      </Suspense>
    );
  }

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/user" element={<User />}>
            <Route
              path="login"
              element={<Login setProfileUser={setProfileUser} />}
            />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot" element={<ForgotPassword />} />
            <Route path="reset/:token" element={<ResetPassword />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />

          <TenantRoutes profileUser={profileUser} />
          <SuperAdminRoutes />
        </Routes>
      </Suspense>

      <Toaster position="top-right" />
    </>
  );
};

export default App;