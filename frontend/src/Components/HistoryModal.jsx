// src/Components/HistoryModal.jsx

import React from "react";

const HistoryModal = ({ instance, onClose }) => {
  const history = instance.lifecycle || [];

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h2>Asset History</h2>

        <div className="history-list">
          {history.map((item, index) => (
            <div key={index} className="history-item">
              <p className="action">{item.action}</p>

              <p>
                {item.from?.employeeName || "-"} →{" "}
                {item.to?.employeeName || "-"}
              </p>

              <span>
                {new Date(item.date).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  );
};

export default HistoryModal;