import React, { useState, useMemo } from "react";
import "../Component_styles/LocationInsights.css";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";

const LocationInsights = ({ items = [] }) => {
  const [selected, setSelected] = useState(items[0]);

  const { currency, convertFromBase } = useCurrency();

  // 🔥 Update selected if data changes
  React.useEffect(() => {
    if (items.length > 0) {
      setSelected(items[0]);
    }
  }, [items]);

  // 📊 Utilization logic
  const getUtilization = (loc) => {
    if (!loc?.total) return 0;
    return Math.round((loc.assigned / loc.total) * 100);
  };

  // 🚦 Status badge logic
  const getStatus = (loc) => {
    if (!loc) return "neutral";

    if (loc.upcomingMaintenance > 2) return "critical";
    if (loc.assigned === 0) return "idle";
    return "healthy";
  };

  return (
    <div className="location-card">
      <h3 className="location-title">📍 Location Intelligence</h3>

      <div className="location-container">

        {/* 🔹 LEFT LIST */}
        <div className="location-list">
          {items.map((loc, index) => (
            <div
              key={index}
              className={`location-item ${
                selected?.name === loc.name ? "active" : ""
              }`}
              onClick={() => setSelected(loc)}
            >
              <div>
                <p className="loc-name">{loc.name}</p>
                <span className="loc-sub">{loc.total} assets</span>
              </div>

              <div className="loc-value">
                {CURRENCY_SYMBOLS[currency]}{" "}
                {convertFromBase(loc.value || 0).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* 🔹 RIGHT DETAILS */}
        {selected && (
          <div className="location-details">

            {/* HEADER */}
            <div className="details-header">
              <h4>{selected.name}</h4>

              <span className={`status-badge ${getStatus(selected)}`}>
                {getStatus(selected) === "critical" && "🔴 High Risk"}
                {getStatus(selected) === "idle" && "🟡 Idle"}
                {getStatus(selected) === "healthy" && "🟢 Healthy"}
              </span>
            </div>

            {/* STATS GRID */}
            <div className="stats-grid">
              <div>
                <p>Total</p>
                <strong>{selected.total}</strong>
              </div>
              <div>
                <p>Assigned</p>
                <strong>{selected.assigned}</strong>
              </div>
              <div>
                <p>Hardware</p>
                <strong>{selected.hardware}</strong>
              </div>
              <div>
                <p>Software</p>
                <strong>{selected.software}</strong>
              </div>
            </div>

            {/* UTILIZATION */}
            <div className="utilization">
              <p>Utilization</p>
              <div className="bar">
                <div
                  className="fill"
                  style={{ width: `${getUtilization(selected)}%` }}
                />
              </div>
              <span>{getUtilization(selected)}%</span>
            </div>

            {/* COSTS */}
            <div className="cost-grid">
              <div>
                <p>Total Value</p>
                <strong>
                  {CURRENCY_SYMBOLS[currency]}{" "}
                  {convertFromBase(selected.value || 0).toLocaleString()}
                </strong>
              </div>

              <div>
                <p>Maintenance</p>
                <span>
                  {convertFromBase(selected.costs?.maintenance || 0).toLocaleString()}
                </span>
              </div>

              <div>
                <p>Warranty</p>
                <span>
                  {convertFromBase(selected.costs?.warranty || 0).toLocaleString()}
                </span>
              </div>

              <div>
                <p>Insurance</p>
                <span>
                  {convertFromBase(selected.costs?.insurance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* EXTRA INFO */}
            <div className="meta">
              <p>
                📦 Instance Locations:{" "}
                {selected.instanceLocations?.join(", ") || "—"}
              </p>

              <p>
                👤 Assigned Locations:{" "}
                {selected.assignedLocations?.length
                  ? selected.assignedLocations.join(", ")
                  : "—"}
              </p>

              <p>
                ⚠ Upcoming Maintenance: {selected.upcomingMaintenance}
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default LocationInsights;