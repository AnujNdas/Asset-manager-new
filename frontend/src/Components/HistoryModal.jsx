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
          <div className="history-summary">
            <p><strong>Instance:</strong> {summary.instanceCode}</p>
            <p><strong>Status:</strong> {summary.status}</p>
            <p><strong>Condition:</strong> {summary.condition}</p>
            <p><strong>Active Service:</strong> {summary.activeService}</p>
            <p><strong>Health Score:</strong> {summary.activeScore}</p>
          </div>
        )}

        {/* TABLE */}
<div className="history-table">
  <div className="history-header">
    <span>Event</span>
    <span>User / Assignment</span>
    <span>Location</span>
    <span>Condition</span>
    <span>Details</span>
    <span>Date</span>
  </div>

  <div className="history-body">
    {history?.length ? (
      history.map((item, index) => (
        <div key={index} className="history-row">

          {/* EVENT */}
          <span className={`event-badge ${item.action?.toLowerCase()}`}>
            {item.action}
          </span>

          {/* USER / ASSIGNMENT */}
<div className="assignment-cell">

  <span>
    {item.assignedTo?.employeeName || "-"}
  </span>

  {item.assignedTo?.departmentName && (
    <small>
      {item.assignedTo.departmentName}
    </small>
  )}

</div>
          {/* LOCATION */}
          <span>{item.location || "-"}</span>

          {/* CONDITION */}
          <span>{item.condition || "-"}</span>

          {/* DETAILS */}
{/* DETAILS */}
<div className="details-cell">

  {/* TITLE */}
  <div className="history-title">
    {item.title || item.action}
  </div>

  {/* DESCRIPTION */}
  <small className="history-description">
    {item.description || "-"}
  </small>

  {/* HARDWARE */}
  {item.hardware && (
    <div className="history-meta">

      {item.hardware?.serialNumber && (
  <small>
    Serial: {item.hardware.serialNumber}
  </small>
)}

      <small>
        Model: {item.hardware.modelNo || "-"}
      </small>

      <small>
        Warranty: {item.hardware.warrantyExpiry || "-"}
      </small>

      <small>
        Maintenance:{" "}
        {item.hardware.nextMaintenanceDate || "-"}
      </small>

    </div>
  )}

  {/* SOFTWARE */}
  {item.software && (
    <div className="history-meta">

{item.software?.licenseNumber && (
  <small>
    License: {item.software.licenseNumber}
  </small>
)}

      <small>
        Renewal:{" "}
        {item.software.renewalDate || "-"}
      </small>

    </div>
  )}

  {/* DEVICE INFO */}
  {item.deviceInfo && (
    <div className="history-meta">

      <small>
        Device:{" "}
        {item.deviceInfo.deviceName || "-"}
      </small>

      <small>
        Serial:{" "}
        {item.deviceInfo.serialNumber || "-"}
      </small>

    </div>
  )}

  {/* REASSIGN */}
  {item.reassignedFrom && (
    <div className="history-meta">

      <small>
        Reassigned From:{" "}
        {item.reassignedFrom.employeeName || "-"}
      </small>

    </div>
  )}

  {/* UPGRADE */}
  {item.upgrade && (
    <div className="history-meta">

      <small>
        Upgrade:{" "}
        {item.upgrade.description || "-"}
      </small>

      {item.upgrade.cost?.amount && (
        <small>
          Cost:{" "}
          {item.upgrade.cost.amount}{" "}
          {item.upgrade.cost.currency}
        </small>
      )}

    </div>
  )}

</div>
          {/* DATE */}
          <span>{item.recordDate}</span>
        </div>
      ))
    ) : (
      <div className="empty">No history available</div>
    )}
  </div>
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