import React from "react";

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return isNaN(d) ? "-" : d.toLocaleDateString();
};

const formatCurrency = (obj) => {
  if (!obj) return "-";

  if (typeof obj === "number") {
    return `INR ${obj}`;
  }

  if (typeof obj === "object") {
    return `${obj.currency || "INR"} ${obj.amount || 0}`;
  }

  return "-";
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

        <div>
          <p className="label">Instance Code</p>
          <p className="value">{instance.instanceCode}</p>
        </div>
        <div>
          <p className="label">Instance Name</p>
          <p className="value">{instance.deviceName}</p>
        </div>
        {/* INSTANCE CODE */}
        {/* QR CODE */}
{isHardware && instance.qrCode?.url && (
  <div className="qr-section">
    <p className="label">QR Code</p>

    <a
      href={instance.trackingUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src={instance.qrCode.url}
        alt="QR Code"
        className="qr-image"
      />
    </a>

    <div className="qr-actions">
      <a
        href={instance.qrCode.url}
        download
        className="btn btn-small"
      >
        Download
      </a>

      <a
        href={instance.trackingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-small btn-blue"
      >
        Open Link
      </a>
    </div>
  </div>
)}
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
            ? formatCurrency(sw.costs?.renewalCost)
            : formatCurrency(hw.costs?.maintenanceCost)}
          </p>
        </div>

        {/* WARRANTY COST */}
        {isHardware && (
          <div>
            <p className="label">Warranty Cost</p>
            <p className="value">
              {formatCurrency(hw.costs?.warrantyRenewalCost)}
            </p>
          </div>
        )}

        {/* INSURANCE COST */}
        {isHardware && (
          <div>
            <p className="label">Insurance Cost</p>
            <p className="value">
              {formatCurrency(hw.costs?.insuranceCost)}
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