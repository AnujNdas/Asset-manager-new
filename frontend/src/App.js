import { Routes, Route } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";

import TenantRoutes from "./routes/TenantRoutes";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";
import AffiliateRoutes from "./routes/AffiliateRoutes";

import TrackInstance from "./Pages/TrackInstance"; 
import MainSite from "./Pages/MainSite"; 
import About from "./Pages/LandingPage/About"
import Contact from "./Pages/LandingPage/Contact";
import { Toaster } from "react-hot-toast";
import MainLayout from "./layout/MainLayout";
import "./App.css";

import UpgradePage from "./Pages/UpgradePage";
import User from "./Pages/User";

import Loader from "./Components/Loader";

import "./Component_styles/ClassificationComponent.css";

import AffiliateApply from "./Inner_sections/AffiliateApply";
import Terms from "./Pages/LandingPage/Terms&Condition";
import MachineryHero from "./Pages/LandingPage/Machinery";
import ItAsswt from "./Pages/LandingPage/ItAsswt";

const Login = lazy(() => import("./Inner_sections/Login"));
const Signup = lazy(() => import("./Inner_sections/Signup"));
const ForgotPassword = lazy(() =>
  import("./Inner_sections/ForgetPass")
);
const ResetPassword = lazy(() =>
  import("./Inner_sections/ResetPass")
);

const Maintenance = lazy(() =>
  import("./Pages/Maintainence")
);

const Unauthorized = lazy(() =>
  import("./Pages/Unauthorized")
);

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<Loader />}>
    {children}
  </Suspense>
);

const App = () => {

  const [profileUser, setProfileUser] =
    useState(null);

  useEffect(() => {
    const storedUsername =
      localStorage.getItem("username");

    if (storedUsername)
      setProfileUser(storedUsername);
  }, []);

  if (
    process.env.REACT_APP_MAINTENANCE_MODE ===
    "true"
  ) {
    return <Maintenance />;
  }

  return (
    <>
      <main>

          {/* =========================
              AFFILIATE APPLY
          ========================== */}
          <Routes>

  <Route element={<MainLayout />}>

      <Route
          path="/"
          element={<MainSite />}
      />

      <Route
          path="/about"
          element={<About />}
      />

      <Route
          path="/contact"
          element={<Contact />}
      />
      <Route
          path="/terms"
          element={<Terms />}
      />
      <Route
          path="/machinery"
          element={<MachineryHero />}
      />
      <Route
          path="/itam-management"
          element={<ItAsswt />}
      />

  </Route>
          <Route
            path="/affiliate/apply"
            element={
              <SuspenseWrapper>
                <AffiliateApply />
              </SuspenseWrapper>
            }
          />

          {/* =========================
              AUTH ROUTES
          ========================== */}
          <Route
            path="/user"
            element={
              <SuspenseWrapper>
                <User />
              </SuspenseWrapper>
            }
          >
            <Route
              path="login"
              element={
                <SuspenseWrapper>
                  <Login
                    setProfileUser={
                      setProfileUser
                    }
                  />
                </SuspenseWrapper>
              }
            />

            <Route
              path="signup"
              element={
                <SuspenseWrapper>
                  <Signup />
                </SuspenseWrapper>
              }
            />

            <Route
              path="forgot"
              element={
                <SuspenseWrapper>
                  <ForgotPassword />
                </SuspenseWrapper>
              }
            />

            <Route
              path="reset/:token"
              element={
                <SuspenseWrapper>
                  <ResetPassword />
                </SuspenseWrapper>
              }
            />
          </Route>

          {/* =========================
              COMMON
          ========================== */}
          <Route
            path="/upgrade"
            element={
              <SuspenseWrapper>
                <UpgradePage />
              </SuspenseWrapper>
            }
          />

          <Route
            path="/unauthorized"
            element={
              <SuspenseWrapper>
                <Unauthorized />
              </SuspenseWrapper>
            }
          />

          {/* =========================
              TENANT ROUTES
          ========================== */}
          {TenantRoutes({
            profileUser,
          })}

          {/* =========================
              SUPER ADMIN ROUTES
          ========================== */}
          {SuperAdminRoutes()}

          {/* =========================
              AFFILIATE ROUTES
          ========================== */}
          {AffiliateRoutes()}

        </Routes>
      </main>

      <Toaster position="top-right" />
    </>
  );
};

export default App;