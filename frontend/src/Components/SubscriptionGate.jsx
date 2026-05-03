import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSubscription } from "../Context/SubscriptionContext";

const SubscriptionGate = () => {
  const { subscription, loading } = useSubscription();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
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