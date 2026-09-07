import React from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock3,
  CalendarDays,
  CalendarRange,
  AlertCircle,
} from "lucide-react";

const SubscriptionSummary = ({ summary }) => {

  const cards = [
    {
      title: "Total Subscriptions",
      value: summary?.totalSubscriptions ?? 0,
      icon: CreditCard,
    },
    {
      title: "Active",
      value: summary?.activeSubscriptions ?? 0,
      icon: CheckCircle2,
    },
    {
      title: "Trial",
      value: summary?.trialSubscriptions ?? 0,
      icon: Clock3,
    },
    {
      title: "Monthly",
      value: summary?.monthlySubscriptions ?? 0,
      icon: CalendarDays,
    },
    {
      title: "Yearly",
      value: summary?.yearlySubscriptions ?? 0,
      icon: CalendarRange,
    },
    {
      title: "Past Due",
      value: summary?.pastDueSubscriptions ?? 0,
      icon: AlertCircle,
    },
  ];

  return (
    <div className="subscription-summary-grid">

      {cards.map((card) => {

        const Icon = card.icon;

        return (
          <div
            className="subscription-summary-card"
            key={card.title}
          >

            <div className="subscription-summary-icon">
              <Icon size={17} />
            </div>

            <div className="subscription-summary-content">

              <span>
                {card.title}
              </span>

              <strong>
                {card.value}
              </strong>

            </div>

          </div>
        );

      })}

    </div>
  );
};

export default SubscriptionSummary;