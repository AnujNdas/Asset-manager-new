import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import TenantRoutes from "./routes/TenantRoutes";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";

import User from "./Pages/User";
import Login from "./Inner_sections/Login";
import Signup from "./Inner_sections/Signup";
import ForgotPassword from "./Inner_sections/ForgetPass";
import ResetPassword from "./Inner_sections/ResetPass";
import { Toaster } from "react-hot-toast";
import Maintenance from "./Pages/Maintainence";
import Unauthorized from "./Pages/Unauthorized";
import "./App.css";
const App = () => {
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setProfileUser(storedUsername);
  }, []);
  
  if (process.env.REACT_APP_MAINTENANCE_MODE === "true") {
  return <Maintenance />;
}

  return (
    <>
      <Routes>
        {TenantRoutes({ profileUser })}
        {SuperAdminRoutes()}
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* Auth / User routes */}
        <Route path="/user" element={<User />}>
          <Route path="login" element={<Login setProfileUser={setProfileUser} />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot" element={<ForgotPassword />} />
          <Route path="reset/:token" element={<ResetPassword />} />
          
        </Route>
      </Routes>

      <Toaster position="top-right" />
    </>
  );
};

export default App;
