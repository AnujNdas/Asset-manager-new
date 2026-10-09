import React, { useEffect, useState } from "react";
import { getInstanceHistory } from "../Services/ApiServices";
import Loader from "./Loader";
const HistoryModal = ({ instance, onClose }) => {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
const fetchHistory = async () => {
  try {
    const res = await getInstanceHistory(instance._id);

    console.log("HISTORY DATA:", res);

    setHistory(res.data || []);     // ✅ correct
    setSummary(res.summary || null);

  } catch (err) {
    console.error(err);
    setHistory([]);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  if (instance?._id) {
    setLoading(true);
    fetchHistory();
  }
}, [instance]);
const formatDate = (date) => {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return "-";
  }
};
const formatCost = (costObj) => {
  if (!costObj) return "N/A";

  // legacy numeric support
  if (typeof costObj === "number") {
    return `USD ${costObj.toFixed(2)}`;
  }

  return `${costObj.currency || "USD"} ${Number(
    costObj.amount || 0
  ).toFixed(2)}`;
};
  return (
<div className="history-overlay" onClick={onClose}>
  <div
    className="history-dialog"
    onClick={(e) => e.stopPropagation()}
  >
    {loading ? (
      <div className="history-loader">
        <Loader />
        <span>Loading asset history...</span>
      </div>
    ) : (
      <>
        {/* =====================================================
            MODAL HEADER
        ===================================================== */}
        <div className="history-dialog-header">
          <div className="history-header-content">
            <span className="history-eyebrow">
              ASSET LIFECYCLE
            </span>

            <h2>Asset History</h2>

            <p>
              Review assignments, upgrades, renewals and
              lifecycle activity for this instance.
            </p>
          </div>

          <button
            type="button"
            className="history-close-icon"
            onClick={onClose}
            aria-label="Close history"
          >
            ×
          </button>
        </div>


        {/* =====================================================
            SCROLLABLE BODY
        ===================================================== */}
        <div className="history-dialog-body">

          {/* ===================================================
              ASSET OVERVIEW
          =================================================== */}
          {summary && (
            <section className="history-overview">

              <div className="history-overview-header">

                <div>
                  <span className="history-section-eyebrow">
                    INSTANCE
                  </span>

                  <h3>
                    {instance.deviceName || "Unnamed Instance"}
                  </h3>

                  <p>{summary.instanceCode}</p>
                </div>

                <div className="history-overview-badges">

                  <span
                    className={`history-status-badge ${
                      summary.status
                        ?.toLowerCase()
                        .replace(/\s+/g, "-") || ""
                    }`}
                  >
                    <span className="history-badge-dot" />
                    {summary.status || "Unknown"}
                  </span>

                  <span className="history-condition-badge">
                    {summary.condition || "Unknown"}
                  </span>

                </div>

              </div>


              <div className="history-overview-grid">

                <div className="history-overview-item">
                  <span>Status</span>
                  <strong>{summary.status || "-"}</strong>
                </div>

                <div className="history-overview-item">
                  <span>Condition</span>
                  <strong>{summary.condition || "-"}</strong>
                </div>

                <div className="history-overview-item">
                  <span>Health Score</span>

                  <strong>
                    {summary.activeScore ?? 0}
                    <small>/100</small>
                  </strong>
                </div>

                <div className="history-overview-item">
                  <span>Active Service</span>
                  <strong>{summary.activeService || "-"}</strong>
                </div>

                <div className="history-overview-item">
                  <span>Purchase Date</span>
                  <strong>{summary.purchaseDate || "-"}</strong>
                </div>

                <div className="history-overview-item">
                  <span>Installation Date</span>
                  <strong>{summary.installationDate || "-"}</strong>
                </div>

              </div>

            </section>
          )}


          {/* ===================================================
              TIMELINE STATS
          =================================================== */}
          <div className="history-stats-grid">

            <div className="history-stat-card">
              <span className="history-stat-label">
                CREATED
              </span>

              <strong>
                {history.find(
                  (h) => h.action === "CREATED"
                )?.recordDate || "-"}
              </strong>

              <small>Initial lifecycle record</small>
            </div>


            <div className="history-stat-card">
              <span className="history-stat-label">
                UPGRADES
              </span>

              <strong>
                {
                  history.filter(
                    (h) => h.action === "UPGRADED"
                  ).length
                }
              </strong>

              <small>Recorded upgrades</small>
            </div>


            <div className="history-stat-card">
              <span className="history-stat-label">
                ASSIGNMENTS
              </span>

              <strong>
                {
                  history.filter(
                    (h) =>
                      h.action === "ASSIGNED" ||
                      h.action === "REASSIGNED"
                  ).length
                }
              </strong>

              <small>Assignment events</small>
            </div>

          </div>


          {/* ===================================================
              TIMELINE HEADER
          =================================================== */}
          <div className="history-timeline-heading">

            <div>
              <span className="history-section-eyebrow">
                ACTIVITY
              </span>

              <h3>Lifecycle Timeline</h3>
            </div>

            <span className="history-event-count">
              {history?.length || 0}{" "}
              {history?.length === 1 ? "event" : "events"}
            </span>

          </div>


          {/* ===================================================
              TIMELINE
          =================================================== */}
          <div className="history-timeline">

            {history?.length ? (
              history.map((item, index) => {

                const isCreated =
                  item.action === "CREATED";

                const isPurchased =
                  item.action === "PURCHASED";

                const isMaintenance =
                  item.action === "MAINTENANCE";

                const isWarranty =
                  item.action === "WARRANTY_RENEWAL";

                const isInsurance =
                  item.action === "INSURANCE_RENEWAL";

                const isUpgrade =
                  item.action === "UPGRADED";

                const isAssigned =
                  item.action === "ASSIGNED";

                const isReassigned =
                  item.action === "REASSIGNED";

                const isReturned =
                  item.action === "RETURNED";

                const isRenewal =
                  item.action === "RENEWAL";

                const actionClass =
                  item.action
                    ?.toLowerCase()
                    .replace(/_/g, "-") || "default";

                return (
                  <div
                    key={index}
                    className={`history-event ${actionClass}`}
                  >
                    {/* TIMELINE RAIL */}
                    <div className="history-event-rail">
                      <span className="history-event-dot" />
                    </div>


                    {/* EVENT CONTENT */}
                    <div className="history-event-card">

                      {/* EVENT HEADER */}
                      <div className="history-event-top">

                        <span
                          className={`history-event-tag ${actionClass}`}
                        >
                          {item.action
                            ?.replace(/_/g, " ")
                            .toUpperCase()}
                        </span>

                        <span className="history-event-date">
                          {item.recordDate || "-"}
                        </span>

                      </div>


                      {/* TITLE */}
                      <div className="history-event-heading">
                        <h4>
                          {item.title || item.action}
                        </h4>

                        {item.description && (
                          <p>{item.description}</p>
                        )}
                      </div>


                      {/* =========================================
                          CREATED
                      ========================================= */}
                      {isCreated && item.hardware && (
                        <div className="history-data-grid">

                          <div className="history-data-item">
                            <span>Model</span>
                            <strong>
                              {item.hardware.modelNo || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Asset Name</span>
                            <strong>
                              {item.deviceName || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Warranty Expiry</span>
                            <strong>
                              {item.hardware.warrantyExpiry || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Next Maintenance</span>
                            <strong>
                              {item.hardware.nextMaintenanceDate || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Insurance Purchase</span>
                            <strong>
                              {item.hardware.insurancePurchaseDate || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Insurance Expiry</span>
                            <strong>
                              {item.hardware.insuranceExpiry || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Insurance Term</span>
                            <strong>
                              {item.hardware.insuranceTerm || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Has Insurance</span>
                            <strong>
                              {item.hardware.hasInsurance
                                ? "Yes"
                                : "No"}
                            </strong>
                          </div>

                        </div>
                      )}


                      {/* =========================================
                          PURCHASE
                      ========================================= */}
                      {isPurchased && (
                        <div className="history-data-grid">

                          <div className="history-data-item">
                            <span>Purchase Cost</span>
                            <strong>
                              {formatCost(
                                item.purchaseCost?.amount
                              )}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Purchase Date</span>
                            <strong>
                              {item.purchaseDate || "-"}
                            </strong>
                          </div>

                        </div>
                      )}


                      {/* =========================================
                          MAINTENANCE
                      ========================================= */}
                      {isMaintenance && (
                        <div className="history-data-grid">

                          <div className="history-data-item">
                            <span>Maintenance Performed</span>
                            <strong>
                              {item.recordDate || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Maintenance Cost</span>
                            <strong>
                              {formatCost(
                                item.maintenance?.cost
                              )}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Previous Due Date</span>
                            <strong>
                              {formatDate(
                                item.from?.dates
                                  ?.maintenanceDate
                              ) || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Next Maintenance</span>
                            <strong>
                              {formatDate(
                                item.to?.dates
                                  ?.maintenanceDate
                              ) || "-"}
                            </strong>
                          </div>

                        </div>
                      )}


                      {/* =========================================
                          WARRANTY
                      ========================================= */}
                      {isWarranty && (
                        <div className="history-data-grid">

                          <div className="history-data-item">
                            <span>Renewal Date</span>
                            <strong>
                              {item.recordDate || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Renewal Cost</span>
                            <strong>
                              {formatCost(
                                item.warranty?.cost
                              )}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>
                              Previous Warranty Expiry
                            </span>
                            <strong>
                              {formatDate(
                                item.from?.dates
                                  ?.warrantyExpiry
                              ) || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>New Warranty Expiry</span>
                            <strong>
                              {formatDate(
                                item.to?.dates
                                  ?.warrantyExpiry
                              ) || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>
                              Warranty Purchase Date
                            </span>
                            <strong>
                              {formatDate(
                                item.to?.dates
                                  ?.warrantyPurchaseDate
                              ) || "-"}
                            </strong>
                          </div>

                        </div>
                      )}


                      {/* =========================================
                          INSURANCE
                      ========================================= */}
                      {isInsurance && (
                        <div className="history-data-grid">

                          <div className="history-data-item">
                            <span>Renewal Date</span>
                            <strong>
                              {item.recordDate || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Insurance Cost</span>
                            <strong>
                              {formatCost(
                                item.insurance?.cost
                              )}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>
                              Previous Insurance Expiry
                            </span>
                            <strong>
                              {formatDate(
                                item.from?.dates
                                  ?.insuranceExpiry
                              ) || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>
                              New Insurance Expiry
                            </span>
                            <strong>
                              {formatDate(
                                item.to?.dates
                                  ?.insuranceExpiry
                              ) || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>
                              Insurance Purchase Date
                            </span>
                            <strong>
                              {formatDate(
                                item.to?.dates
                                  ?.insurancePurchaseDate
                              ) || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Insurance Term</span>
                            <strong>
                              {item.insurance?.term || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Has Insurance</span>
                            <strong>
                              {item.insurance?.hasInsurance
                                ? "Yes"
                                : "No"}
                            </strong>
                          </div>

                          <div className="history-data-item history-data-wide">
                            <span>Coverage Type</span>

                            <strong>
                              {item.insurance?.coverageType
                                ?.length
                                ? item.insurance.coverageType
                                    .map((type) =>
                                      type
                                        .replace(/_/g, " ")
                                        .replace(
                                          /\b\w/g,
                                          (c) =>
                                            c.toUpperCase()
                                        )
                                    )
                                    .join(", ")
                                : "-"}
                            </strong>
                          </div>

                        </div>
                      )}


                      {/* =========================================
                          SOFTWARE RENEWAL
                      ========================================= */}
                      {isRenewal && item.software && (
                        <div className="history-data-grid">

                          <div className="history-data-item">
                            <span>Renewal Date</span>
                            <strong>
                              {item.recordDate || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Renewal Cost</span>
                            <strong>
                              {formatCost(item.cost)}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>License Number</span>
                            <strong>
                              {item.software
                                ?.licenseNumber || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Previous Renewal</span>
                            <strong>
                              {item.from?.dates
                                ?.renewalDate || "-"}
                            </strong>
                          </div>

                          <div className="history-data-item">
                            <span>Next Renewal</span>
                            <strong>
                              {item.to?.dates
                                ?.renewalDate || "-"}
                            </strong>
                          </div>

                        </div>
                      )}


                      {/* =========================================
                          ASSIGNED
                      ========================================= */}
                      {isAssigned && (
                        <div className="history-assignment-card">

                          <div>
                            <span>Employee</span>
                            <strong>
                              {item.assignedTo
                                ?.employeeName || "-"}
                            </strong>
                          </div>

                          <div>
                            <span>Employee ID</span>
                            <strong>
                              {item.assignedTo
                                ?.employeeId || "-"}
                            </strong>
                          </div>

                          <div>
                            <span>Department</span>
                            <strong>
                              {item.assignedTo
                                ?.departmentName || "-"}
                            </strong>
                          </div>

                          <div>
                            <span>Location</span>
                            <strong>
                              {item.location || "-"}
                            </strong>
                          </div>

                          <div>
                            <span>Assigned On</span>
                            <strong>
                              {item.recordDate || "-"}
                            </strong>
                          </div>

                        </div>
                      )}


                      {/* =========================================
                          REASSIGNED
                      ========================================= */}
                      {isReassigned && (
                        <>
                          <div className="history-transfer">

                            <div className="history-transfer-user">
                              <span>FROM</span>

                              <strong>
                                {item.reassignedFrom
                                  ?.employeeName || "-"}
                              </strong>

                              <small>
                                {item.reassignedFrom
                                  ?.departmentName || "-"}
                              </small>
                            </div>


                            <div className="history-transfer-arrow">
                              →
                            </div>


                            <div className="history-transfer-user">
                              <span>TO</span>

                              <strong>
                                {item.assignedTo
                                  ?.employeeName || "-"}
                              </strong>

                              <small>
                                {item.assignedTo
                                  ?.departmentName || "-"}
                              </small>
                            </div>

                          </div>


                          <div className="history-data-grid">

                            <div className="history-data-item">
                              <span>New Location</span>
                              <strong>
                                {item.location || "-"}
                              </strong>
                            </div>

                            <div className="history-data-item">
                              <span>Transfer Date</span>
                              <strong>
                                {item.recordDate || "-"}
                              </strong>
                            </div>

                          </div>
                        </>
                      )}


                      {/* =========================================
                          RETURNED
                      ========================================= */}
                      {isReturned && (
                        <div className="history-assignment-card">

                          <div>
                            <span>Returned By</span>
                            <strong>
                              {item.from
                                ?.employeeName || "-"}
                            </strong>
                          </div>

                          <div>
                            <span>Department</span>
                            <strong>
                              {item.from
                                ?.departmentName || "-"}
                            </strong>
                          </div>

                          <div>
                            <span>Returned On</span>
                            <strong>
                              {item.recordDate || "-"}
                            </strong>
                          </div>

                          <div>
                            <span>Current Status</span>
                            <strong>
                              {item.status || "-"}
                            </strong>
                          </div>

                        </div>
                      )}


                      {/* =========================================
                          UPGRADE
                      ========================================= */}
                      {isUpgrade && (
                        <>
                          <div className="history-upgrade-card">

                            <div className="history-upgrade-row">
                              <span>Upgrade Date</span>
                              <strong>
                                {item.recordDate || "-"}
                              </strong>
                            </div>

                            <div className="history-upgrade-row">
                              <span>
                                Previous Condition
                              </span>
                              <strong>
                                {item.upgrade
                                  ?.previousCondition ||
                                  "-"}
                              </strong>
                            </div>

                            <div className="history-upgrade-row">
                              <span>New Condition</span>
                              <strong>
                                {item.upgrade
                                  ?.newCondition || "-"}
                              </strong>
                            </div>

                            {item.upgrade?.description && (
                              <div className="history-upgrade-row">
                                <span>Description</span>

                                <strong>
                                  {item.upgrade.description}
                                </strong>
                              </div>
                            )}

                          </div>


                          {/* COST CHANGES */}
                          <div className="history-data-grid">

                            {item.from?.costs
                              ?.maintenanceCost !==
                              item.to?.costs
                                ?.maintenanceCost && (
                              <div className="history-data-item">
                                <span>
                                  Maintenance Cost
                                </span>

                                <strong>
                                  {formatCost({
                                    amount:
                                      item.from?.costs
                                        ?.maintenanceCost ||
                                      0,
                                  })}
                                  {" → "}
                                  {formatCost({
                                    amount:
                                      item.to?.costs
                                        ?.maintenanceCost ||
                                      0,
                                  })}
                                </strong>
                              </div>
                            )}


                            {item.from?.costs
                              ?.warrantyRenewalCost !==
                              item.to?.costs
                                ?.warrantyRenewalCost && (
                              <div className="history-data-item">
                                <span>
                                  Warranty Cost
                                </span>

                                <strong>
                                  {formatCost({
                                    amount:
                                      item.from?.costs
                                        ?.warrantyRenewalCost ||
                                      0,
                                  })}
                                  {" → "}
                                  {formatCost({
                                    amount:
                                      item.to?.costs
                                        ?.warrantyRenewalCost ||
                                      0,
                                  })}
                                </strong>
                              </div>
                            )}


                            {item.from?.costs
                              ?.insuranceCost !==
                              item.to?.costs
                                ?.insuranceCost && (
                              <div className="history-data-item">
                                <span>
                                  Insurance Cost
                                </span>

                                <strong>
                                  {formatCost({
                                    amount:
                                      item.from?.costs
                                        ?.insuranceCost ||
                                      0,
                                  })}
                                  {" → "}
                                  {formatCost({
                                    amount:
                                      item.to?.costs
                                        ?.insuranceCost ||
                                      0,
                                  })}
                                </strong>
                              </div>
                            )}


                            {item.from?.costs
                              ?.renewalCost !==
                              item.to?.costs
                                ?.renewalCost && (
                              <div className="history-data-item">
                                <span>
                                  Renewal Cost
                                </span>

                                <strong>
                                  {formatCost({
                                    amount:
                                      item.from?.costs
                                        ?.renewalCost || 0,
                                  })}
                                  {" → "}
                                  {formatCost({
                                    amount:
                                      item.to?.costs
                                        ?.renewalCost || 0,
                                  })}
                                </strong>
                              </div>
                            )}

                          </div>
                        </>
                      )}

                    </div>
                  </div>
                );
              })
            ) : (
              <div className="history-empty">

                <div className="history-empty-icon">
                  ↺
                </div>

                <h3>No History Available</h3>

                <p>
                  This asset doesn't have any recorded
                  lifecycle events yet.
                </p>

              </div>
            )}

          </div>

        </div>


        {/* =====================================================
            FIXED FOOTER
        ===================================================== */}
        <div className="history-dialog-footer">

          <span>
            {history?.length || 0} lifecycle{" "}
            {history?.length === 1 ? "event" : "events"}
          </span>

          <button
            type="button"
            className="history-close-btn"
            onClick={onClose}
          >
            Close
          </button>

        </div>
      </>
    )}
  </div>
</div>
  );
};

export default HistoryModal;