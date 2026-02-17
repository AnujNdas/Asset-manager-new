import { Route } from "react-router-dom";
import TenantLayout from "../layouts/TenantLayout";
import ProtectedRoute from "../Components/ProtectedRoute";

import Dashboard from "../Pages/AdminDashboard";
import AssetCapture from "../Pages/AssetCapture";
import Inventory from "../Pages/Inventory";
import Setting from "../Pages/Setting";
import Classification from "../Pages/Classification";
import MisReport from "../Pages/MisReport";
import AssignmentPage from "../Pages/AssignmentPage";
import Onboarding from "../Pages/OnBoarding";
// import Checkout from "../Pages/Checkout";
import EmployeePage from "../Pages/Employee";
const TenantRoutes = ({ profileUser }) => (
  <Route element={<ProtectedRoute allowedRoles={["admin", "user"]} />}>
    <Route element={<TenantLayout profileUser={profileUser} />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/assetCapture" element={<AssetCapture />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/setting/*" element={<Setting />} />
      <Route path="/classification/*" element={<Classification />} />
      <Route path="/misreport" element={<MisReport />} />
      {/* <Route path="/scanner" element={<AssetScanner />} /> */}
      <Route path="/assignment" element={<AssignmentPage />} />
      <Route path="/onboarding" element={<Onboarding />} />
      {/* <Route path="/checkout" element={<Checkout />} /> */}
      <Route path="/employee" element={<EmployeePage />} />
    </Route>
  </Route>
);

export default TenantRoutes;
