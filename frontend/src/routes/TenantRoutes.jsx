import { Route, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";

import TenantLayout from "../layout/TenantLayout";
import ProtectedRoute from "../Components/ProtectedRoute";
import SubscriptionGate from "../Components/SubscriptionGate";
const Dashboard = lazy(() => import("../Pages/AdminDashboard"));
const AssetCapture = lazy(() => import("../Pages/AssetCapture"));
const Inventory = lazy(() => import("../Pages/Inventory"));
const Setting = lazy(() => import("../Pages/Setting"));
const Classification = lazy(() => import("../Pages/Classification"));
const MisReport = lazy(() => import("../Pages/MisReport"));
const AssetScanner = lazy(() => import("../Pages/Scanner"));
const AssignmentPage = lazy(() => import("../Pages/AssignmentPage"));
const Onboarding = lazy(() => import("../Pages/OnBoarding"));
const EmployeePage = lazy(() => import("../Pages/Employee"));
const Subscription = lazy(() => import("../Inner_sections/Subscription"));
const AssetInstance = lazy(() => import("../Pages/AssetInstance"));
const CreateInstance = lazy(() => import("../Pages/CreateInstance"))
const InstanceTracking = lazy(() => import("../Pages/InstanceTracking"))
const TrackInstance = lazy(() => import("../Pages/TrackInstance"));
const TenantRoutes = ({ profileUser }) => (
  <Route element={<ProtectedRoute allowedRoles={["admin", "user"]} />}>

    {/* ✅ Single Layout */}
    <Route element={<TenantLayout profileUser={profileUser} />}>

      <Route
        element={
          <Suspense fallback={<div className="page-loader">Loading...</div>}>
            <Outlet />
          </Suspense>
        }
      >
        {/* ✅ PUBLIC (within auth, but no subscription needed) */}
        <Route path="/subscription" element={<Subscription />} />

        {/* 🔒 SUBSCRIPTION PROTECTED */}
        <Route element={<SubscriptionGate />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assetCapture" element={<AssetCapture />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/setting/*" element={<Setting />} />
          <Route path="/classification/*" element={<Classification />} />
          <Route path="/misreport" element={<MisReport />} />
          <Route path="/scanner" element={<AssetScanner />} />
          <Route path="/assignment" element={<AssignmentPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/employee" element={<EmployeePage />} />
          <Route path="/instance-assets" element={<AssetInstance />} />
          <Route path="/create-instances/:assetId" element={<CreateInstance />} />  
          <Route path="/tracking" element={<InstanceTracking />} />  
          <Route path="/track/:id" element={<TrackInstance />} />
        </Route>

      </Route>

    </Route>

  </Route>
);

export default TenantRoutes;