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
          <span>
            {item.assignedTo?.employeeName || "-"}
            {item.assignedTo?.departmentName && (
              <small>
                {item.assignedTo.departmentName}
              </small>
            )}
          </span>

          {/* LOCATION */}
          <span>{item.location || "-"}</span>

          {/* CONDITION */}
          <span>{item.condition || "-"}</span>

          {/* DETAILS */}
          <span className="details-cell">

            {/* CREATED */}
            {item.action === "CREATED" && (
              <>
                <div>Instance Created</div>

                {item.serialNumber && (
                  <small>Serial: {item.serialNumber}</small>
                )}

                {item.licenseNumber && (
                  <small>License: {item.licenseNumber}</small>
                )}
              </>
            )}

            {/* ASSIGNED */}
            {item.action === "ASSIGNED" && (
              <>
                <div>
                  Assigned to{" "}
                  {item.assignedTo?.employeeName || "-"}
                </div>

                {item.deviceInfo?.deviceName && (
                  <small>
                    Device: {item.deviceInfo.deviceName}
                  </small>
                )}
              </>
            )}

            {/* REASSIGNED */}
            {item.action === "REASSIGNED" && (
              <>
                <div>
                  Reassigned from{" "}
                  {item.from?.employeeName || "-"}
                </div>

                <small>
                  To {item.to?.employeeName || "-"}
                </small>
              </>
            )}

            {/* UPGRADE */}
            {item.action === "UPGRADE" && (
              <>
                <div>{item.notes || "Asset upgraded"}</div>

                {item.upgrade?.description && (
                  <small>
                    {item.upgrade.description}
                  </small>
                )}
              </>
            )}

          </span>

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