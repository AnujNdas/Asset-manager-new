import { Routes, Route } from "react-router-dom";
import { useEffect, useState, lazy , Suspense } from "react";

import TenantRoutes from "./routes/TenantRoutes";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";
import { Toaster } from "react-hot-toast";
import "./App.css";

import User from "./Pages/User";
import Loader from "./Components/Loader";
import "./Component_styles/ClassificationComponent.css";
const Login = lazy(() => import("./Inner_sections/Login"));
const Signup = lazy(() => import("./Inner_sections/Signup"));
const ForgotPassword = lazy(() => import("./Inner_sections/ForgetPass"));
const ResetPassword = lazy(() => import("./Inner_sections/ResetPass"));
const Maintenance = lazy(() => import("./Pages/Maintainence"));
const Unauthorized = lazy(() => import("./Pages/Unauthorized"));
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<Loader/>}>{children}</Suspense>
);
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
      <main>
        <Routes>
          <Route path="/user" element={<SuspenseWrapper><User /></SuspenseWrapper>}>
            <Route
              path="login"
              element={<SuspenseWrapper><Login setProfileUser={setProfileUser}/> </SuspenseWrapper>}
            />
            <Route path="signup" element={<SuspenseWrapper><Signup /></SuspenseWrapper>} />
            <Route path="forgot" element={<SuspenseWrapper><ForgotPassword /></SuspenseWrapper>} />
            <Route path="reset/:token" element={<SuspenseWrapper><ResetPassword /></SuspenseWrapper>} />
          </Route>

          <Route path="/unauthorized" element={<SuspenseWrapper><Unauthorized /></SuspenseWrapper>} />

          {TenantRoutes({ profileUser })}
          {SuperAdminRoutes()}
        </Routes>
      </main>

      <Toaster position="top-right" />
    </>
  );
};

export default App;