import { useEffect, useState } from "react";
import { useSubscription } from "../Context/SubscriptionContext";
import "../Component_styles/PlanTimer.css";

const PlanTimer = () => {
  const { subscription } = useSubscription();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 480);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
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

  if (!subscription) return null;

  const isUrgent = timeLeft && timeLeft.days < 2;

  const isExpired =
    subscription?.lifecycle?.isExpired ||
    subscription?.status === "expired";
    
  const statusClass = isExpired
    ? "expired"
    : isUrgent
    ? "urgent"
    : "normal";
console.log("PLAN TIMER", {
  status: subscription?.status,
  lifecycle: subscription?.lifecycle,
});
  return (
    <div className={`plan-timer ${statusClass}`}>
      {isExpired ? (
        <span className="label">Subscription Expired</span>
      ) : (
        <>
          <span className="label">
            {subscription.isTrial ? "Trial Ends In" : "Renews In"}
          </span>

          {timeLeft ? (
            <div className="time">
              {isMobile ? `${timeLeft.days} days left`
                : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
            </div>
          ) : (
            <div className="time expired-text">Expired</div>
          )}
        </>
      )}
    </div>
  );
};

export default PlanTimer;