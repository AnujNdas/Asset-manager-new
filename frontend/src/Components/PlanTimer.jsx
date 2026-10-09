import { useEffect, useState } from "react";
import { useSubscription } from "../Context/SubscriptionContext";
import "../Component_styles/PlanTimer.css";
import { FiClock } from "react-icons/fi";
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
// console.log("PLAN TIMER", {
//   status: subscription?.status,
//   lifecycle: subscription?.lifecycle,
// });
  return (

<div
  className={`plan-timer ${statusClass}`}
  role="timer"
  aria-label="Subscription countdown"
>
  <div className="plan-timer-icon">
    <FiClock />
  </div>

  <div className="plan-timer-details">
    {isExpired ? (
      <>
        <span className="label">
          Subscription Status
        </span>

        <span className="time expired-text">
          Subscription Expired
        </span>
      </>
    ) : (
      <>
        <span className="label">
          {subscription.isTrial
            ? "Trial Ends In"
            : "Renews In"}
        </span>

        {timeLeft ? (
          <span className="time">
            {isMobile
              ? `${timeLeft.days}d ${timeLeft.hours}h left`
              : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
          </span>
        ) : (
          <span className="time expired-text">
            Expired
          </span>
        )}
      </>
    )}
  </div>

  <div
    className={`plan-timer-indicator ${
      isExpired ? "expired" : ""
    }`}
  />
</div>

  );
};

export default PlanTimer;