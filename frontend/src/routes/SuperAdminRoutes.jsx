  import { Route } from "react-router-dom";
  import ProtectedRoute from "../Components/ProtectedRoute";
  import SuperAdminLayout from "../layout/SuperAdminLayout";
  import Analytics from "../Pages/super-admin/Analytics";
  import Dashboard from "../Pages/super-admin/SuperAdminDashboard";
  import Tenants from "../Pages/super-admin/Tenant";
  import Settings from "../Pages/super-admin/SuperAdminSetting";
  import SuperAdminTickets from "../Pages/super-admin/SuperAdminTicket";
  import LoginActivity from "../Pages/super-admin/ActivityCheck";
const SuperAdminRoutes = () => (
<Route element={<ProtectedRoute allowedRoles={["super-admin"]} />}>
  <Route path="/super-admin" element={<SuperAdminLayout />}>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="organizations" element={<Tenants />} />
    <Route path="settings" element={<Settings />} />
    {/* <Route path="analytics" element={<Analytics />} /> */}
    <Route path="tickets" element={<SuperAdminTickets />} />
    <Route path="activity" element={<LoginActivity />} />
  </Route>
</Route>

);

  export default SuperAdminRoutes;
