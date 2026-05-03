import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSubscription } from "../Context/SubscriptionContext";
import Loader from "./Loader";
const SubscriptionGate = () => {
 const { subscription, loading, expired } = useSubscription();
  const location = useLocation();

if (loading) return <Loader />;

if (expired || !subscription?.access?.hasAccess) {
  return <Navigate to="/upgrade" replace />;
}
  // ❌ No access → redirect to upgrade
  if (!subscription?.access?.hasAccess) {
    return (
      <Navigate
        to="/upgrade"
        state={{
          reason: subscription?.access?.reason,
          from: location.pathname
        }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default SubscriptionGate;