import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSubscription } from "../Context/SubscriptionContext";
import Loader from "./Loader";
const SubscriptionGate = () => {
  const { subscription, loading, expired } = useSubscription();
  const location = useLocation();

  if (loading || subscription === null) {
    return <Loader />;
  }

  const hasAccess = subscription?.access?.hasAccess;

  if (expired || !hasAccess) {
    return (
      <Navigate
        to="/upgrade"
        state={{
          reason:
            subscription?.access?.reason ||
            (expired ? "plan_expired" : "no_subscription"),
          from: location.pathname
        }}
        replace
      />
    );
  }

  return <Outlet />;
};
export default SubscriptionGate;