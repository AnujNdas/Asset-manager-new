import { Route } from "react-router-dom";
import TenantLayout from "../layout/TenantLayout";
import ProtectedRoute from "../Components/ProtectedRoute";

import Dashboard from "../Pages/AdminDashboard";
import AssetCapture from "../Pages/AssetCapture";
import Inventory from "../Pages/Inventory";
import Setting from "../Pages/Setting";
import Classification from "../Pages/Classification";
import MisReport from "../Pages/MisReport";
import AssetScanner from "../Pages/Scanner";
import AssignmentPage from "../Pages/AssignmentPage";
import Onboarding from "../Pages/OnBoarding";
import EmployeePage from "../Pages/Employee";
import Subscription from "../Inner_sections/Subscription";
import Unauthorized from "../Pages/Unauthorized";
const TenantRoutes = ({ profileUser }) => (
  <Route element={<ProtectedRoute allowedRoles={["admin", "user"]} />}>
    <Route element={<TenantLayout profileUser={profileUser} />}>
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
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Route>
  </Route>
);

export default TenantRoutes;
