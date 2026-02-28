import { createContext, useContext, useEffect, useState } from "react";
import { getMySubscription } from "../Services/ApiServices/Subscription";

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  const fetchSubscription = async () => {
    try {
      const data = await getMySubscription();
      setSubscription(data);
      setExpired(false);
    } catch (err) {
      if (err.response?.status === 402) {
        setExpired(true);
        setSubscription(null);
      } else {
        console.error("Subscription fetch failed", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{ subscription, loading, expired, refreshSubscription: fetchSubscription }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);