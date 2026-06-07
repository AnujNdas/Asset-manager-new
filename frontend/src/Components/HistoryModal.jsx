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
<div className="modal-overlay">
  <div className="modal history-modal">

    {loading ? (
      <div className="loader-wrapper">
        <Loader />   {/* your existing loader */}
      </div>
    ) : (
      <>
        {/* HEADER */}
        <h2>Asset History</h2>

        {/* SUMMARY */}
{summary && (

  <div className="asset-overview">

    <div className="overview-header">

      <h3>
        {instance.deviceName}
      </h3>

      <span>
        {summary.instanceCode}
      </span>

    </div>

    <div className="overview-grid">

      <div>
        <label>Status</label>
        <span>{summary.status}</span>
      </div>

      <div>
        <label>Condition</label>
        <span>{summary.condition}</span>
      </div>

      <div>
        <label>Health Score</label>
        <span>
          {summary.activeScore}/100
        </span>
      </div>

      <div>
        <label>Active Service</label>
        <span>
          {summary.activeService}
        </span>
      </div>

      <div>
        <label>Purchase Date</label>
        <span>
          {summary.purchaseDate}
        </span>
      </div>

      <div>
        <label>Installation Date</label>
        <span>
          {summary.installationDate}
        </span>
      </div>

    </div>

  </div>

)}
        {/* TABLE */}
{/* TIMELINE STATS */}

<div className="history-stats">

  <div className="stat-card">
    <span>Created</span>
    <h3>
      {
        history.find(
          h => h.action === "CREATED"
        )?.recordDate || "-"
      }
    </h3>
  </div>

  <div className="stat-card">
    <span>Upgrades</span>
    <h3>
      {
        history.filter(
          h => h.action === "UPGRADED"
        ).length
      }
    </h3>
  </div>

  <div className="stat-card">
    <span>Assignments</span>
    <h3>
      {
        history.filter(
          h =>
            h.action === "ASSIGNED" ||
            h.action === "REASSIGNED"
        ).length
      }
    </h3>
  </div>

</div>

{/* TIMELINE */}

<div className="asset-timeline">

  {history?.length ? (

    history.map((item, index) => (

      <div
        key={index}
        className={`timeline-event ${item.action?.toLowerCase()}`}
      >

        <div className="timeline-dot" />

        <div className="timeline-content">

          {/* TOP BAR */}

          <div className="timeline-top">

            <span
              className={`event-tag ${item.action?.toLowerCase()}`}
            >
              {item.action}
            </span>

            <span className="event-date">
              {item.recordDate}
            </span>

          </div>

          {/* TITLE */}

          <h4 className="timeline-title">
            {item.title}
          </h4>

          {/* DESCRIPTION */}

          <p className="timeline-description">
            {item.description}
          </p>

          {/* ASSIGNMENT */}

          {(item.action === "ASSIGNED" ||
            item.action === "REASSIGNED") && (

            <div className="user-card">

              <div>
                <strong>Employee</strong>
                <span>
                  {
                    item.assignedTo?.employeeName ||
                    "-"
                  }
                </span>
              </div>

              <div>
                <strong>Department</strong>
                <span>
                  {
                    item.assignedTo?.departmentName ||
                    "-"
                  }
                </span>
              </div>

              <div>
                <strong>Location</strong>
                <span>
                  {item.location || "-"}
                </span>
              </div>

            </div>

          )}

          {/* REASSIGN FLOW */}

          {item.reassignedFrom?.employeeName && (

            <div className="transfer-card">

              <div className="transfer-user">

                <small>From</small>

                <strong>
                  {
                    item.reassignedFrom
                      .employeeName
                  }
                </strong>

              </div>

              <div className="transfer-arrow">
                →
              </div>

              <div className="transfer-user">

                <small>To</small>

                <strong>
                  {
                    item.assignedTo
                      ?.employeeName
                  }
                </strong>

              </div>

            </div>

          )}

          {/* UPGRADE INFO */}

          {item.action === "UPGRADED" &&
            item.upgrade && (

            <div className="upgrade-card">

              <div className="upgrade-row">

                <span>
                  Previous Condition
                </span>

                <strong>
                  {
                    item.upgrade
                      .previousCondition ||
                    "-"
                  }
                </strong>

              </div>

              <div className="upgrade-row">

                <span>
                  New Condition
                </span>

                <strong>
                  {
                    item.upgrade
                      .newCondition || "-"
                  }
                </strong>

              </div>

              {item.upgrade.description && (

                <div className="upgrade-row">

                  <span>
                    Upgrade Details
                  </span>

                  <strong>
                    {
                      item.upgrade
                        .description
                    }
                  </strong>

                </div>

              )}

            </div>

          )}

          {/* HARDWARE DETAILS */}

          {item.hardware && (

            <div className="hardware-grid">

              <div className="hardware-item">

                <label>Model</label>

                <span>
                  {item.hardware.modelNo}
                </span>

              </div>

              <div className="hardware-item">

                <label>Serial</label>

                <span>
                  {
                    item.hardware
                      .serialNumber
                  }
                </span>

              </div>

              <div className="hardware-item">

                <label>Warranty</label>

                <span>
                  {
                    item.hardware
                      .warrantyExpiry
                  }
                </span>

              </div>

              <div className="hardware-item">

                <label>Maintenance</label>

                <span>
                  {
                    item.hardware
                      .nextMaintenanceDate
                  }
                </span>

              </div>

            </div>

          )}

          {/* SOFTWARE DETAILS */}

          {item.software && (

            <div className="hardware-grid">

              <div className="hardware-item">

                <label>License</label>

                <span>
                  {
                    item.software
                      .licenseNumber
                  }
                </span>

              </div>

              <div className="hardware-item">

                <label>Renewal</label>

                <span>
                  {
                    item.software
                      .renewalDate
                  }
                </span>

              </div>

            </div>

          )}

        </div>

      </div>

    ))

  ) : (

    <div className="empty-history">

      <h3>
        No History Available
      </h3>

      <p>
        This asset doesn't have any
        recorded lifecycle events yet.
      </p>

    </div>

  )}

</div>

        {/* ACTION */}
        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Close</button>
        </div>
      </>
    )}

  </div>
</div>
  );
};

export default HistoryModal;