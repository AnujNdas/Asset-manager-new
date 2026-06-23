import React from "react";
import "./AuditOverviewCards.css";

const AuditOverviewCards = ({ data }) => {
  const cards = [
    {
      title: "Total Assets",
      value: data?.totalAssets || 0,
    },
    {
      title: "Asset Value",
      value: `$${(
        data?.totalAssetValue || 0
      ).toLocaleString()}`,
    },
    {
      title: "Assigned",
      value: data?.assignedAssets || 0,
    },
    {
      title: "Issues",
      value:
        (data?.damagedAssets || 0) +
        (data?.stolenAssets || 0),
    },
  ];

  return (
    <div className="audit-cards">
      {cards.map((card) => (
        <div className="audit-card" key={card.title}>
          <span>{card.title}</span>

          <h2>{card.value}</h2>
        </div>
      ))}
    </div>
  );
};

export default AuditOverviewCards;