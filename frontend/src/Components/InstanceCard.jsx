// src/Components/InstanceCard.jsx

import React from "react";

const InstanceCard = ({ instance, onReassign, onHistory , onUpgrade }) => {
  return (
    <div className="instance-card">

      <div className="instance-grid">

        <div>
          <p className="label">Asset No</p>
          <p className="value">{instance.instanceCode}</p>
        </div>

        <div>
          <p className="label">Unique ID</p>
          <p className="value">{instance.uniqueIdentifier || "-"}</p>
        </div>

        <div>
          <p className="label">
            {instance.assetType === "hardware" ? "Model No" : "Vendor"}
          </p>
          <p className="value">
            {instance.assetType === "hardware"
              ? instance.hardwareDetails?.modelNo || "-"
              : instance.softwareDetails?.vendor || "-"}
          </p>
        </div>

        <div>
          <p className="label">Insurance Cost</p>
          <p className="value">
            ₹{instance.costTracking?.insuranceCost || 0}
          </p>
        </div>

        <div>
          <p className="label">Warranty Cost</p>
          <p className="value">
            ₹{instance.costTracking?.warrantyRenewalCost || 0}
          </p>
        </div>

        <div>
          <p className="label">Warranty Expiry</p>
          <p className="value">
            {instance.warranty?.expiryDate
              ? new Date(instance.warranty.expiryDate).toLocaleDateString()
              : "-"}
          </p>
        </div>

        <div>
          <p className="label">Assigned To</p>
          <p className="value">
            {instance.assignedTo?.employeeName || "Not Assigned"}
          </p>
        </div>

        {/* Software extra */}
        {instance.assetType === "software" && (
          <div>
            <p className="label">License</p>
            <p className="value">
              {instance.softwareDetails?.licenseKey || "-"}
            </p>
          </div>
        )}

      </div>

      <div className="actions">
        <button
          className="btn btn-blue"
          onClick={() => onReassign(instance)}
        >
          Reassign
        </button>

        <button
          className="btn btn-dark"
          onClick={() => onHistory(instance)}
        >
          History
        </button>

<button
  className="btn btn-blue"
  onClick={() => onUpgrade(instance)}
>
  Upgrade
</button>
      </div>
    </div>
  );
};

export default InstanceCard;