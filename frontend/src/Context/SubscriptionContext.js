import { createContext, useContext, useEffect, useState } from "react";
import { getMySubscription } from "../Services/Subscription";

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      const data = await getMySubscription();

      // ✅ Always store response (even expired)
      setSubscription(data);

    } catch (err) {
      console.error("Subscription fetch failed", err);

      // fallback safe state
      setSubscription({
        access: { hasAccess: false, reason: "network_error" },
        lifecycle: { isExpired: true }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        refreshSubscription: fetchSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);