import { Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import ProtectedRoute from "../Components/ProtectedRoute";
import SuperAdminLayout from "../layout/SuperAdminLayout";
import Financial from "../Pages/super-admin/Financial";

const Dashboard = lazy(() => import("../Pages/super-admin/SuperAdminDashboard"));
const Tenants = lazy(() => import("../Pages/super-admin/Tenant"));
const Settings = lazy(() => import("../Pages/super-admin/SuperAdminSetting"));
const SuperAdminTickets = lazy(() => import("../Pages/super-admin/SuperAdminTicket"));
const LoginActivity = lazy(() => import("../Pages/super-admin/ActivityCheck"));
const HealthMonitor = lazy(() => import("../Pages/super-admin/HealthMonitor"))
// const Analytics = lazy(() => import("../Pages/super-admin/Analytics"));

const SuperAdminRoutes = () => (
  <Route element={<ProtectedRoute allowedRoles={["super-admin"]} />}>
    <Route path="/super-admin" element={<SuperAdminLayout />}>

      <Route
        path="dashboard"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        }
      />

      <Route
        path="organizations"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <Tenants />
          </Suspense>
        }
      />

      <Route
        path="settings"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <Settings />
          </Suspense>
        }
      />

      {/* 
      <Route
        path="analytics"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <Analytics />
          </Suspense>
        }
      />
      */}

      <Route
        path="tickets"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <SuperAdminTickets />
          </Suspense>
        }
      />

      <Route
        path="activity"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <LoginActivity />
          </Suspense>
        }
      />
      <Route
        path="health"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <HealthMonitor />
          </Suspense>
        }
      />
      <Route
        path="financials"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <Financial/>
          </Suspense>
        }
      />

    </Route>
  </Route>
);

export default SuperAdminRoutes;