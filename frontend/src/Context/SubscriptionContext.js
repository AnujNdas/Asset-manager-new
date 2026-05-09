import { createContext, useContext, useEffect, useState } from "react";
import { getMySubscription } from "../Services/Subscription";

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  const fetchSubscription = async () => {
    try {
      setLoading(true);                // ✅ FIX 1
      setExpired(false);              // ✅ FIX 2 (reset stale state)

      const data = await getMySubscription();

      setSubscription(data);

      // ✅ derive expired immediately
      if (data?.currentEnd) {
        const isExpired =
          new Date(data.currentEnd).getTime() <= Date.now();
        setExpired(isExpired);
      }

    } catch (err) {
      console.error("Subscription fetch failed", err);

      setSubscription({
        access: { hasAccess: false, reason: "network_error" },
        lifecycle: { isExpired: true }
      });

      setExpired(true); // fallback
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const auth = localStorage.getItem("auth");

  // ✅ Don't fetch if user not logged in
  if (!auth) {
    setLoading(false);
    return;
  }

  const currentPath = window.location.pathname;

  const publicRoutes = [
    "/user/login",
    "/user/forgot",
  ];

  const isResetRoute =
    currentPath.startsWith("/user/reset/");

  // ✅ Skip public auth pages
  if (
    publicRoutes.includes(currentPath) ||
    isResetRoute
  ) {
    setLoading(false);
    return;
  }

  fetchSubscription();
}, []);
  // 🔥 live expiry timer
  useEffect(() => {
    if (!subscription?.currentEnd) return;

    const expiryTime = new Date(subscription.currentEnd).getTime();
    const now = Date.now();

    if (expiryTime <= now) {
      setExpired(true);
      return;
    }

    const timer = setTimeout(() => {
      setExpired(true);
    }, expiryTime - now);

    return () => clearTimeout(timer);
  }, [subscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        expired,                 // ✅ FIX 3 (expose it)
        refreshSubscription: fetchSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);