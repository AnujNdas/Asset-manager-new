import React, { useEffect } from "react";
import { useSubscription } from "../Context/SubscriptionContext";
import { useNavigate } from "react-router-dom";

const UpgradePage = () => {
  const { subscription, loading } = useSubscription();
  const navigate = useNavigate();

  
  const reason = subscription?.access?.reason;
  
  /* 🔥 Optional: auto redirect after few seconds */
  useEffect(() => {
      const timer = setTimeout(() => {
          navigate("/subscription");
        }, 5000); // 5 sec delay
        
        return () => clearTimeout(timer);
    }, [navigate]);
    
    const getMessage = () => {
        switch (reason) {
            case "plan_expired":
                return "Your subscription has expired.";
                case "payment_overdue":
                    return "Your payment is overdue. Please renew to continue.";
                    case "no_subscription":
                        return "You don't have an active subscription.";
                        default:
                            return "Access to this feature requires a subscription.";
                        }
                    };
                    
if (loading) return <div>Loading...</div>;
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Upgrade Required</h1>

        <p style={styles.message}>{getMessage()}</p>

        <p style={styles.subtext}>
          You will be redirected to the subscription page shortly.
        </p>

        <button
          style={styles.button}
          onClick={() => navigate("/subscription")}
        >
          Go to Subscription
        </button>
      </div>
    </div>
  );
};

export default UpgradePage;

/* 🔥 Simple styling (you can move to CSS later) */
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f9fafb",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    maxWidth: "400px",
  },
  title: {
    marginBottom: "10px",
  },
  message: {
    fontSize: "16px",
    marginBottom: "10px",
  },
  subtext: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#6366f1",
    color: "#fff",
    cursor: "pointer",
  },
};