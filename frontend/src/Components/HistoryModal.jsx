import React, { useEffect, useState } from "react";
import { getInstanceHistory } from "../Services/ApiServices";

const HistoryModal = ({ instance, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await getInstanceHistory(instance._id);
      setHistory(res.data.data);
      console.log("HISTORY DATA:", res);
    } catch (err) {
      console.error(err);
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

        {/* TABLE HEADER */}
        <div className="history-header">
          <span>Warranty Dates</span>
          <span>Maintenance Dates</span>
          <span>Location</span>
          <span>Assigned Person</span>
          <span>Active Service</span>
          <span>Active Score</span>
          <span>Component Evolution</span>
          <span>Record Date</span>
        </div>

        {/* TABLE BODY */}
        <div className="history-body">
          {history.map((item, index) => (
            <div key={index} className="history-row">

              <span>{item.warrantyDate}</span>
              <span>{item.maintenanceDate}</span>
              <span>{item.location}</span>
              <span>{item.assignedPerson}</span>
              <span>{item.activeService}</span>
              <span>{item.score}</span>
              <span>{item.componentEvolution}</span>
              <span>{item.recordDate}</span>

            </div>
          ))}
        </div>

        {/* ACTION */}
        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  );
};

export default HistoryModal;