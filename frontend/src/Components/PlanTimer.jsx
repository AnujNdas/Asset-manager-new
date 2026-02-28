import { useEffect, useState } from "react";
import { useSubscription } from "../Context/SubscriptionContext";

const PlanTimer = () => {
  const { subscription, expired } = useSubscription();
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!subscription?.currentEnd) return;

    const updateTimer = () => {
      const now = Date.now();
      const end = new Date(subscription.currentEnd).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [subscription]);

  if (expired) return <div>Subscription Expired</div>;
  if (!subscription) return null;
  
  return (
    <div>
      {subscription.isTrial ? "Trial ends in:" : "Renews in:"}
      {timeLeft ? (
        <h3>
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </h3>
      ) : (
        <h3>Expired</h3>
      )}
    </div>
  );
};

export default PlanTimer;