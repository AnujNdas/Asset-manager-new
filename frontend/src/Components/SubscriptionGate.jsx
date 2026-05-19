import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSubscription } from "../Context/SubscriptionContext";
import Loader from "./Loader";

const SubscriptionGate = () => {
  const { subscription, loading } = useSubscription();
  const location = useLocation();

  // ✅ Allow onboarding flow routes without subscription
  const onboardingRoutes = [
    "/onboarding",
    "/classification",
    "/employee",
  ];

  if (onboardingRoutes.includes(location.pathname)) {
    return <Outlet />;
  }

  if (loading || subscription === null) {
    return <Loader />;
  }

  const hasAccess = subscription?.access?.hasAccess;

  const isExpired =
    subscription?.lifecycle?.isExpired ||
    subscription?.status === "expired";

  console.log("SUB GATE", {
    hasAccess,
    isExpired,
    subscription,
  });

  if (isExpired || !hasAccess) {
    return (
      <Navigate
        to="/upgrade"
        state={{
          reason:
            subscription?.access?.reason ||
            (isExpired
              ? "plan_expired"
              : "no_subscription"),
          from: location.pathname,
        }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default SubscriptionGate;