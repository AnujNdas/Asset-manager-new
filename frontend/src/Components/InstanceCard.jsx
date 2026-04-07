import React from "react";

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return isNaN(d) ? "-" : d.toLocaleDateString();
};

const formatCurrency = (obj) => {
  if (!obj?.amount) return "-";
  return `${obj.currency || "INR"} ${obj.amount}`;
};

const InstanceCard = ({ instance, onReassign, onHistory, onUpgrade }) => {
  const isHardware = instance.assetType === "hardware";
  const isSoftware = instance.assetType === "software";

  const hw = instance.hardware || {};
  const sw = instance.software || {};
  const assignment = instance.assignment;

  return (
    <div className="instance-card">

      <div className="instance-grid">

        {/* INSTANCE CODE */}
        <div>
          <p className="label">Instance Code</p>
          <p className="value">{instance.instanceCode}</p>
        </div>

        {/* UNIQUE IDENTIFIER */}
        <div>
          <p className="label">
            {isSoftware ? "License Number" : "Model No"}
          </p>
          <p className="value">
            {isSoftware
              ? sw.licenseNumber || "-"
              : hw.modelNo || "-"}
          </p>
        </div>

        {/* COST (PRIMARY) */}
        <div>
          <p className="label">
            {isSoftware ? "Renewal Cost" : "Maintenance Cost"}
          </p>
          <p className="value">
            {isSoftware
              ? sw.costs?.renewalCost || 0
              : hw.costs?.maintenanceCost || 0}
          </p>
        </div>

        {/* WARRANTY COST */}
        {isHardware && (
          <div>
            <p className="label">Warranty Cost</p>
            <p className="value">
              {hw.costs?.warrantyRenewalCost || 0}
            </p>
          </div>
        )}

        {/* INSURANCE COST */}
        {isHardware && (
          <div>
            <p className="label">Insurance Cost</p>
            <p className="value">
              {hw.costs?.insuranceCost || 0}
            </p>
          </div>
        )}

        {/* PURCHASE COST */}
        <div>
          <p className="label">Purchase Cost</p>
          <p className="value">
            {isSoftware
              ? formatCurrency(sw.purchaseCost)
              : formatCurrency(hw.purchaseCost)}
          </p>
        </div>

        {/* WARRANTY / RENEWAL DATE */}
        <div>
          <p className="label">
            {isSoftware ? "Renewal Date" : "Warranty Expiry"}
          </p>
          <p className="value">
            {isSoftware
              ? formatDate(sw.renewalDate)
              : formatDate(hw.warrantyExpiry)}
          </p>
        </div>

        {/* INSTALLATION */}
        <div>
          <p className="label">Installation Date</p>
          <p className="value">
            {formatDate(
              isSoftware
                ? sw.installationDate
                : hw.installationDate
            )}
          </p>
        </div>

        {/* INSURANCE EXPIRY */}
        {isHardware && (
          <div>
            <p className="label">Insurance Expiry</p>
            <p className="value">
              {formatDate(hw.insuranceExpiry)}
            </p>
          </div>
        )}

        {/* LAST USED (SOFTWARE) */}
        {isSoftware && (
          <div>
            <p className="label">Last Used</p>
            <p className="value">
              {formatDate(sw.lastUsedDate)}
            </p>
          </div>
        )}

        {/* ASSIGNED PERSON */}
        <div>
          <p className="label">Assigned To</p>
          <p className="value">
            {assignment?.employee?.name || "Not Assigned"}
          </p>
        </div>

        {/* DEPARTMENT */}
        <div>
          <p className="label">Department</p>
          <p className="value">
            {assignment?.department || "-"}
          </p>
        </div>

        {/* DEVICE INFO */}
        <div>
          <p className="label">Device</p>
          <p className="value">
            {assignment?.deviceInfo?.deviceName || "-"}
          </p>
        </div>

        <div>
          <p className="label">Asset Tag</p>
          <p className="value">
            {assignment?.deviceInfo?.assetTag || "-"}
          </p>
        </div>

        {/* LOCATION */}
        <div>
          <p className="label">Location</p>
          <p className="value">
            {assignment?.location || instance.location || "-"}
          </p>
        </div>

      </div>

      {/* ACTIONS */}
      <div className="actions">
        <button className="btn btn-blue" onClick={() => onReassign(instance)}>
          Reassign
        </button>

        <button className="btn btn-dark" onClick={() => onHistory(instance)}>
          History
        </button>

        <button className="btn btn-blue" onClick={() => onUpgrade(instance)}>
          Upgrade
        </button>
      </div>
    </div>
  );
};

export default InstanceCard;