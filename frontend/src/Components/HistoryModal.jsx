import React, { useEffect, useState } from "react";
import { getInstanceHistory } from "../Services/ApiServices";

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
    fetchHistory();
  }, []);

  if (loading) return <div className="modal">Loading...</div>;

  return (
    <div className="modal-overlay">
      <div className="modal history-modal">

        {/* HEADER */}
        <h2>Asset History</h2>

        {/* ✅ SUMMARY PANEL */}
        {summary && (
          <div className="history-summary">
            <p><strong>Instance:</strong> {summary.instanceCode}</p>
            <p><strong>Status:</strong> {summary.status}</p>
            <p><strong>Condition:</strong> {summary.condition}</p>
            <p><strong>Active Service:</strong> {summary.activeService}</p>
            <p><strong>Health Score:</strong> {summary.activeScore}</p>
          </div>
        )}

        {/* TABLE HEADER */}
        <div className="history-header">
          <span>Warranty</span>
          <span>Maintenance</span>
          <span>Status</span>
          <span>Location</span>
          <span>Assigned</span>
          <span>Service</span>
          <span>Score</span>
          <span>Event</span>
          <span>Date</span>
        </div>

        {/* TABLE BODY */}
<div className="history-body">
  {history?.length ? (
    history.map((item, index) => (
      <div key={index} className="history-row">

        {/* WARRANTY */}
        <span>{item.warrantyDate || "-"}</span>

        {/* MAINTENANCE */}
        <span>
          {item.nextMaintenanceDate || "-"}
          <br />
          <small>{item.maintenanceStatus || "-"}</small>
        </span>

        {/* STATUS */}
        <span>{item.status || item.action}</span>

        {/* LOCATION */}
        <span>{item.location || "-"}</span>

        {/* PERSON */}
        <span>{item.assignedPerson || "-"}</span>

        {/* SERVICE */}
        <span>{item.activeService || "-"}</span>

        {/* SCORE */}
        <span>{item.activeScore ?? "-"}</span>

        {/* EVENT */}
        <span>
          {item.type === "assignment"
            ? `${item.action} (${item.deviceName || "Device"})`
            : item.notes}
        </span>

        {/* DATE */}
        <span>{item.recordDate}</span>

      </div>
    ))
  ) : (
    <div className="empty">No history available</div>
  )}
</div>

        {/* ACTION */}
        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Close</button>
        </div>

      </div>
    </div>
  );
};

export default HistoryModal;