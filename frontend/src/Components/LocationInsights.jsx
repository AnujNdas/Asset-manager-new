import React, { useState, useMemo } from "react";
import "../Component_styles/LocationInsights.css";
import { useCurrency } from "../Context/CurrencyContext";
import {
  FiMapPin,
  FiList,
  FiChevronRight,
  FiBox,
  FiLayers,
  FiUserCheck,
  FiHardDrive,
  FiMonitor,
  FiDollarSign,
  FiInfo,
  FiUsers,
  FiTool,
} from "react-icons/fi";
import { CURRENCY_SYMBOLS } from "../utils/currency";
import { useOrganization } from "../Context/OrganizationContext";
const LocationInsights = ({ items = [] }) => {
  const { organization } = useOrganization();
  const currencySymbol = CURRENCY_SYMBOLS[organization?.currency] || "$";
  const [selected, setSelected] = useState(items[0]);

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

  {/* ================= HEADER ================= */}

  <div className="location-header">
    <div className="location-header-left">
      <span className="location-header-icon">
        <FiMapPin />
      </span>

      <div>
        <h3 className="location-title">
          Location Intelligence
        </h3>
        <p>
          Monitor asset distribution, utilization, and costs.
        </p>
      </div>
    </div>

    <span className="location-count">
      {items.length} Locations
    </span>
  </div>


  {/* ================= MAIN LAYOUT ================= */}

  <div className="location-container">

    {/* ================= LEFT LOCATION LIST ================= */}

    <div className="location-list-panel">

      <div className="location-panel-heading">
        <FiList />
        <span>Asset Locations</span>
      </div>

      <div className="location-list">

        {items.length === 0 ? (

          <div className="location-empty">
            <FiMapPin />
            <p>No location data available</p>
          </div>

        ) : (

          items.map((loc, index) => (

            <button
              type="button"
              key={index}
              className={`location-item ${
                selected?.name === loc.name ? "active" : ""
              }`}
              onClick={() => setSelected(loc)}
              aria-pressed={selected?.name === loc.name}
            >

              <div className="location-item-info">

                <span className="location-item-icon">
                  <FiMapPin />
                </span>

                <div className="location-item-text">
                  <p className="loc-name">{loc.name}</p>

                  <span className="loc-sub">
                    {loc.total || 0} Assets
                  </span>
                </div>

              </div>


              <div className="location-item-right">

                <span className="loc-value">
                  {currencySymbol}{" "}
                  {Number(loc.value || 0).toLocaleString()}
                </span>

                <FiChevronRight className="location-item-arrow" />

              </div>

            </button>

          ))

        )}

      </div>

    </div>


    {/* ================= RIGHT DETAILS ================= */}

    {selected ? (

      <div className="location-details">

        {/* ================= DETAILS HEADER ================= */}

        <div className="details-header">

          <div className="details-heading">

            <span className="details-location-icon">
              <FiMapPin />
            </span>

            <div>
              <h4>{selected.name}</h4>
              <p>Location overview and asset insights</p>
            </div>

          </div>


          <span
            className={`status-badge ${getStatus(selected)}`}
          >
            <span className="status-dot" />

            {getStatus(selected) === "critical" && "High Risk"}
            {getStatus(selected) === "idle" && "Idle"}
            {getStatus(selected) === "healthy" && "Healthy"}

          </span>

        </div>


        {/* ================= ASSET STATISTICS ================= */}

        <div className="location-section-label">
          <FiBox />
          <span>Asset Overview</span>
        </div>

        <div className="stats-grid">

          <div className="location-stat-box">
            <span className="location-stat-icon">
              <FiLayers />
            </span>

            <p>Total Assets</p>
            <strong>{selected.total || 0}</strong>
          </div>

          <div className="location-stat-box">
            <span className="location-stat-icon">
              <FiUserCheck />
            </span>

            <p>Assigned</p>
            <strong>{selected.assigned || 0}</strong>
          </div>

          <div className="location-stat-box">
            <span className="location-stat-icon">
              <FiHardDrive />
            </span>

            <p>Hardware</p>
            <strong>{selected.hardware || 0}</strong>
          </div>

          <div className="location-stat-box">
            <span className="location-stat-icon">
              <FiMonitor />
            </span>

            <p>Software</p>
            <strong>{selected.software || 0}</strong>
          </div>

        </div>


        {/* ================= UTILIZATION ================= */}

        <div className="utilization">

          <div className="utilization-header">

            <div>
              <h5>Asset Utilization</h5>
              <p>Percentage of assets currently assigned</p>
            </div>

            <strong>
              {getUtilization(selected)}%
            </strong>

          </div>

          <div
            className="bar"
            role="progressbar"
            aria-label="Asset utilization"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.max(
              0,
              Math.min(100, Number(getUtilization(selected)) || 0)
            )}
          >
            <div
              className="fill"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, Number(getUtilization(selected)) || 0)
                )}%`,
              }}
            />
          </div>

        </div>


        {/* ================= FINANCIAL OVERVIEW ================= */}

        <div className="location-section-label">
          <FiDollarSign />
          <span>Financial Overview</span>
        </div>

        <div className="cost-grid">

          <div className="location-cost-box">
            <span className="cost-label">
              Total Value
            </span>

            <strong>
              {currencySymbol}{" "}
              {Number(selected.value || 0).toLocaleString()}
            </strong>
          </div>

          <div className="location-cost-box">
            <span className="cost-label">
              Maintenance
            </span>

            <strong>
              {currencySymbol}{" "}
              {Number(
                selected.costs?.maintenance || 0
              ).toLocaleString()}
            </strong>
          </div>

          <div className="location-cost-box">
            <span className="cost-label">
              Warranty
            </span>

            <strong>
              {currencySymbol}{" "}
              {Number(
                selected.costs?.warranty || 0
              ).toLocaleString()}
            </strong>
          </div>

          <div className="location-cost-box">
            <span className="cost-label">
              Insurance
            </span>

            <strong>
              {currencySymbol}{" "}
              {Number(
                selected.costs?.insurance || 0
              ).toLocaleString()}
            </strong>
          </div>

        </div>


        {/* ================= ADDITIONAL INFORMATION ================= */}

        <div className="location-section-label">
          <FiInfo />
          <span>Additional Information</span>
        </div>

        <div className="meta">

          <div className="location-meta-row">

            <span className="meta-icon">
              <FiBox />
            </span>

            <div>
              <p>Asset Locations</p>
              <span>
                {selected.assetLocations?.length
                  ? selected.assetLocations.join(", ")
                  : "—"}
              </span>
            </div>

          </div>


          <div className="location-meta-row">

            <span className="meta-icon">
              <FiMapPin />
            </span>

            <div>
              <p>Instance Locations</p>
              <span>
                {selected.instanceLocations?.length
                  ? selected.instanceLocations.join(", ")
                  : "—"}
              </span>
            </div>

          </div>


          <div className="location-meta-row">

            <span className="meta-icon">
              <FiUsers />
            </span>

            <div>
              <p>Assigned Locations</p>
              <span>
                {selected.assignedLocations?.length
                  ? selected.assignedLocations.join(", ")
                  : "—"}
              </span>
            </div>

          </div>


          <div className="location-meta-row">

            <span className="meta-icon">
              <FiTool />
            </span>

            <div>
              <p>Upcoming Maintenance</p>
              <span>
                {selected.upcomingMaintenance ?? 0}
              </span>
            </div>

          </div>

        </div>

      </div>

    ) : (

      <div className="location-details location-no-selection">

        <FiMapPin />

        <h4>Select a location</h4>

        <p>
          Choose a location to view its asset statistics,
          utilization, and financial details.
        </p>

      </div>

    )}

  </div>

</div>

  );
};

export default LocationInsights;