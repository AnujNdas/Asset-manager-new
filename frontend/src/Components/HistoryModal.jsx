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

    history.map((item, index) => {
      console.log(item)
      const isCreated = item.action === "CREATED";
      const isPurchased = item.action === "PURCHASED";
      const isMaintenance = item.action === "MAINTENANCE";
      const isWarranty = item.action === "WARRANTY_RENEWAL";
      const isInsurance = item.action === "INSURANCE_RENEWAL";
      const isUpgrade = item.action === "UPGRADED";
      const isAssigned = item.action === "ASSIGNED";
      const isReassigned = item.action === "REASSIGNED";
      const isReturned = item.action === "RETURNED";
      const isRenewal = item.action === "RENEWAL";
      return (
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
          {item.action === "UPGRADED" && item.from?.costs && item.to?.costs && (

  <div className="hardware-grid">

    {item.from.costs.maintenanceCost !== item.to.costs.maintenanceCost && (
      <div className="hardware-item">
        <label>Maintenance Cost</label>
        <span>
          USD {item.from.costs.maintenanceCost} → USD {item.to.costs.maintenanceCost}
        </span>
      </div>
    )}

    {item.from.costs.warrantyRenewalCost !== item.to.costs.warrantyRenewalCost && (
      <div className="hardware-item">
        <label>Warranty Renewal</label>
        <span>
          USD {item.from.costs.warrantyRenewalCost} → USD {item.to.costs.warrantyRenewalCost}
        </span>
      </div>
    )}

    {item.from.costs.insuranceCost !== item.to.costs.insuranceCost && (
      <div className="hardware-item">
        <label>Insurance Cost</label>
        <span>
          USD {item.from.costs.insuranceCost} → USD {item.to.costs.insuranceCost}
        </span>
      </div>
    )}

    {item.from.costs.renewalCost !== item.to.costs.renewalCost && (
      <div className="hardware-item">
        <label>Software Renewal</label>
        <span>
          USD {item.from.costs.renewalCost} → USD {item.to.costs.renewalCost}
        </span>
      </div>
    )}

  </div>

)}

{isCreated && item.hardware && (

<div className="hardware-grid">

  <div className="hardware-item">
    <label>Model</label>
    <span>{item.hardware.modelNo}</span>
  </div>

  <div className="hardware-item">
    <label>Asset Name</label>
    <span>{item.deviceName}</span>
  </div>

  <div className="hardware-item">
    <label>Warranty Expiry</label>
    <span>{item.hardware.warrantyExpiry}</span>
  </div>

  <div className="hardware-item">
    <label>Next Maintenance</label>
    <span>{item.hardware.nextMaintenanceDate}</span>
  </div>

  <div className="hardware-item">
    <label>Insurance Purchase</label>
    <span>{item.hardware.insurancePurchaseDate}</span>
  </div>

  <div className="hardware-item">
    <label>Insurance Expiry</label>
    <span>{item.hardware.insuranceExpiry}</span>
  </div>

  <div className="hardware-item">
    <label>Insurance Term</label>
    <span>{item.hardware.insuranceTerm}</span>
  </div>

  <div className="hardware-item">
    <label>Has Insurance</label>
    <span>{item.hardware.hasInsurance ? "Yes" : "No"}</span>
  </div>

</div>

)}
{isPurchased && (

<div className="hardware-grid">

  <div className="hardware-item">
    <label>Purchase Cost</label>
    <span>{formatCost(item.purchaseCost?.amount)}</span>
  </div>

  <div className="hardware-item">
    <label>Purchase Date</label>
    <span>{item.purchaseDate}</span>
  </div>

</div>

)}
{isMaintenance && (

  <div className="hardware-grid">

    <div className="hardware-item">
      <label>Maintenance Performed</label>
      <span>{item.recordDate}</span>
    </div>

    <div className="hardware-item">
      <label>Maintenance Cost</label>
      <span>{formatCost(item.maintenance?.cost)}</span>
    </div>

    <div className="hardware-item">
      <label>Previous Due Date</label>
      <span>{formatDate(item.from?.dates?.maintenanceDate) || "-"}</span>
    </div>

    <div className="hardware-item">
      <label>Next Maintenance</label>
      <span>{formatDate(item.to?.dates?.maintenanceDate) || "-"}</span>
    </div>

  </div>

)}
{isWarranty && (

  <div className="hardware-grid">

    <div className="hardware-item">
      <label>Renewal Date</label>
      <span>{item.recordDate}</span>
    </div>

    <div className="hardware-item">
      <label>Renewal Cost</label>
      <span>{formatCost(item.warranty?.cost)}</span>
    </div>

    <div className="hardware-item">
      <label>Previous Warranty Expiry</label>
      <span>{formatDate(item.from?.dates?.warrantyExpiry) || "-"}</span>
    </div>

    <div className="hardware-item">
      <label>New Warranty Expiry</label>
      <span>{formatDate(item.to?.dates?.warrantyExpiry) || "-"}</span>
    </div>

    <div className="hardware-item">
      <label>Warranty Purchase Date</label>
      <span>{formatDate(item.to?.dates?.warrantyPurchaseDate) || "-"}</span>
    </div>

  </div>

)}
{isInsurance && (

  <div className="hardware-grid">

    <div className="hardware-item">
      <label>Renewal Date</label>
      <span>{item.recordDate}</span>
    </div>

    <div className="hardware-item">
      <label>Insurance Cost</label>
      <span>{formatCost(item.insurance?.cost)}</span>
    </div>

    <div className="hardware-item">
      <label>Previous Insurance Expiry</label>
      <span>{formatDate(item.from?.dates?.insuranceExpiry || "-")}</span>
    </div>

    <div className="hardware-item">
      <label>New Insurance Expiry</label>
      <span>{formatDate(item.to?.dates?.insuranceExpiry || "-")}</span>
    </div>

    <div className="hardware-item">
      <label>Insurance Purchase Date</label>
      <span>{formatDate(item.to?.dates?.insurancePurchaseDate || "-")}</span>
    </div>

    <div className="hardware-item">
      <label>Insurance Term</label>
      <span>{item.insurance?.term || "-"}</span>
    </div>

    {/* <div className="hardware-item">
      <label>Has Insurance</label>
      <span>{item.hardware?.hasInsurance ? "Yes" : "No"}</span>
    </div> */}

  </div>

)}
{isRenewal && item.software && (

  <div className="hardware-grid">

    <div className="hardware-item">
      <label>Renewal Date</label>
      <span>{item.recordDate}</span>
    </div>

    <div className="hardware-item">
      <label>Renewal Cost</label>
      <span>{formatCost(item.cost)}</span>
    </div>

    <div className="hardware-item">
      <label>License Number</label>
      <span>{item.software.licenseNumber || "-"}</span>
    </div>

    <div className="hardware-item">
      <label>Previous Renewal</label>
      <span>{item.from?.dates?.renewalDate || "-"}</span>
    </div>

    <div className="hardware-item">
      <label>Next Renewal</label>
      <span>{item.to?.dates?.renewalDate || "-"}</span>
    </div>

  </div>

)}
{isAssigned && (

  <div className="user-card">

    <div>
      <strong>Employee</strong>
      <span>{item.assignedTo?.employeeName || "-"}</span>
    </div>

    <div>
      <strong>Employee ID</strong>
      <span>{item.assignedTo?.employeeId || "-"}</span>
    </div>

    <div>
      <strong>Department</strong>
      <span>{item.assignedTo?.departmentName || "-"}</span>
    </div>

    <div>
      <strong>Location</strong>
      <span>{item.location || "-"}</span>
    </div>

    <div>
      <strong>Assigned On</strong>
      <span>{item.recordDate}</span>
    </div>

  </div>

)}
{isReassigned && (

<>
  <div className="transfer-card">

    <div className="transfer-user">

      <small>From</small>

      <strong>
        {item.reassignedFrom?.employeeName || "-"}
      </strong>

      <span>
        {item.reassignedFrom?.departmentName || "-"}
      </span>

    </div>

    <div className="transfer-arrow">
      →
    </div>

    <div className="transfer-user">

      <small>To</small>

      <strong>
        {item.assignedTo?.employeeName || "-"}
      </strong>

      <span>
        {item.assignedTo?.departmentName || "-"}
      </span>

    </div>

  </div>

  <div className="hardware-grid">

    <div className="hardware-item">
      <label>New Location</label>
      <span>{item.location}</span>
    </div>

    <div className="hardware-item">
      <label>Transfer Date</label>
      <span>{item.recordDate}</span>
    </div>

  </div>

</>

)}
{isReturned && (

<div className="user-card">

  <div>
    <strong>Returned By</strong>
    <span>{item.from?.employeeName || "-"}</span>
  </div>

  <div>
    <strong>Department</strong>
    <span>{item.from?.departmentName || "-"}</span>
  </div>

  <div>
    <strong>Returned On</strong>
    <span>{item.recordDate}</span>
  </div>

  <div>
    <strong>Current Status</strong>
    <span>{item.status}</span>
  </div>

</div>

)}
{isUpgrade && (

<>
  {/* Basic Upgrade Information */}
  <div className="upgrade-card">

    <div className="upgrade-row">
      <span>Upgrade Date</span>
      <strong>{item.recordDate}</strong>
    </div>

    <div className="upgrade-row">
      <span>Previous Condition</span>
      <strong>{item.upgrade?.previousCondition || "-"}</strong>
    </div>

    <div className="upgrade-row">
      <span>New Condition</span>
      <strong>{item.upgrade?.newCondition || "-"}</strong>
    </div>

    {item.upgrade?.description && (
      <div className="upgrade-row">
        <span>Description</span>
        <strong>{item.upgrade.description}</strong>
      </div>
    )}

  </div>

  {/* Changes */}
  <div className="hardware-grid">

    {/* Maintenance Cost */}
    {item.from?.costs?.maintenanceCost !== item.to?.costs?.maintenanceCost && (
      <div className="hardware-item">
        <label>Maintenance Cost</label>
        <span>
          {formatCost({ amount: item.from.costs.maintenanceCost })}
          {" → "}
          {formatCost({ amount: item.to.costs.maintenanceCost })}
        </span>
      </div>
    )}

    {/* Warranty Cost */}
    {item.from?.costs?.warrantyRenewalCost !== item.to?.costs?.warrantyRenewalCost && (
      <div className="hardware-item">
        <label>Warranty Cost</label>
        <span>
          {formatCost({ amount: item.from.costs.warrantyRenewalCost })}
          {" → "}
          {formatCost({ amount: item.to.costs.warrantyRenewalCost })}
        </span>
      </div>
    )}

    {/* Insurance Cost */}
    {item.from?.costs?.insuranceCost !== item.to?.costs?.insuranceCost && (
      <div className="hardware-item">
        <label>Insurance Cost</label>
        <span>
          {formatCost({ amount: item.from.costs.insuranceCost })}
          {" → "}
          {formatCost({ amount: item.to.costs.insuranceCost })}
        </span>
      </div>
    )}

    {/* Software Renewal */}
    {item.from?.costs?.renewalCost !== item.to?.costs?.renewalCost && (
      <div className="hardware-item">
        <label>Renewal Cost</label>
        <span>
          {formatCost({ amount: item.from.costs.renewalCost })}
          {" → "}
          {formatCost({ amount: item.to.costs.renewalCost })}
        </span>
      </div>
    )}

  </div>

</>

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
      )

})

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