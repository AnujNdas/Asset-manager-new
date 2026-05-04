import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSubscription } from "../Context/SubscriptionContext";
import Loader from "./Loader";

const SubscriptionGate = () => {
  const { subscription, loading, expired } = useSubscription();
  const location = useLocation();

  // ⛔ Wait until subscription is loaded
  if (loading) return <Loader />;

  const hasAccess = subscription?.access?.hasAccess;

  // ❌ Block access
  if (expired || !hasAccess) {
    return (
      <Navigate
        to="/upgrade"
        state={{
          reason: subscription?.access?.reason || (expired ? "plan_expired" : "no_subscription"),
          from: location.pathname
        }}
        replace
      />
    );
  }

  // ✅ Allow access
  return <Outlet />;
};

export default SubscriptionGate;