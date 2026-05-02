import React from "react";
import "../Component_styles/InstanceInventory.css"

const InstanceCard = ({
  inst,
  assignment,
  convertFromBase,
  formatMoney,
  onEdit
}) => {
  const isAssigned = !!assignment;
  const isHardware = inst.assetType === "hardware";

  const hw = inst.hardware || {};
  const sw = inst.software || {};

  const qrUrl = inst.qrCode?.url || hw.qrCode?.url;

  const getCost = (costObj) => {
    if (!costObj) return 0;
    return convertFromBase
      ? convertFromBase(costObj.baseAmount || 0)
      : costObj.amount || 0;
  };

  /* ================= COST LOGIC ================= */
  const purchase = isHardware
    ? getCost(hw.purchaseCost)
    : getCost(sw.purchaseCost);

  const yearly = isHardware
    ? getCost(hw.costs?.maintenanceCost) +
      getCost(hw.costs?.insuranceCost) +
      getCost(hw.costs?.warrantyRenewalCost)
    : getCost(sw.costs?.renewalCost);

  const monthly = yearly / 12;

  /* ================= DATE HELPERS ================= */
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString() : "N/A";

  return (
    <div className="instance-card-v2">

      {/* ================= HEADER ================= */}
      <div className="card-header">
        <div>
          <h3>{inst.instanceCode}</h3>
          <p className="sub">
            {isHardware
              ? hw.serialNumber || "No Serial"
              : `🔑 ${sw.licenseNumber || "No License"}`}
          </p>
        </div>

        <span className={`status ${isAssigned ? "assigned" : "free"}`}>
          {isAssigned ? "Assigned" : "Available"}
        </span>
      </div>

      {/* ================= KPI STRIP ================= */}
      <div className="kpi-strip">
        <div>
          <p>Purchase</p>
          <h4>{purchase}</h4>
        </div>
        <div>
          <p>Yearly</p>
          <h4>{yearly}</h4>
        </div>
        <div>
          <p>Monthly</p>
          <h4>{monthly.toFixed(2)}</h4>
        </div>
        <div>
          <p>Location</p>
          <h4>{inst.location || "N/A"}</h4>
        </div>
      </div>

      {/* ================= BODY GRID ================= */}
      <div className="card-grid">

        {/* LEFT COLUMN */}
        <div className="col">

          {/* HARDWARE */}
          {isHardware && (
            <>
              <div className="card-box">
                <h5>Technical</h5>
                <p><span>Model:</span> {hw.modelNo || "N/A"}</p>
                <p><span>Specs:</span> {hw.specifications || "N/A"}</p>
              </div>

              <div className="card-box">
                <h5>Lifecycle</h5>
                <p><span>Purchase:</span> {formatDate(hw.purchaseDate)}</p>
                <p><span>Maintenance:</span> {formatDate(hw.nextMaintenanceDate)}</p>
                <p><span>Warranty:</span> {formatDate(hw.warrantyExpiry)}</p>
              </div>
            </>
          )}

          {/* SOFTWARE */}
          {!isHardware && (
            <>
              <div className="card-box">
                <h5>License</h5>
                <p><span>Key:</span> {sw.licenseKey || "N/A"}</p>
                <p><span>Number:</span> {sw.licenseNumber || "N/A"}</p>
              </div>

              <div className="card-box">
                <h5>Validity</h5>
                <p><span>Expiry:</span> {formatDate(sw.renewalDate)}</p>
                <p><span>Last Used:</span> {formatDate(sw.lastUsedDate)}</p>
              </div>
            </>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="col">

          {/* COST */}
          <div className="card-box">
            <h5>Cost Breakdown</h5>

            {isHardware ? (
              <>
                <p>Maintenance: {getCost(hw.costs?.maintenanceCost)}</p>
                <p>Warranty: {getCost(hw.costs?.warrantyRenewalCost)}</p>
                <p>Insurance: {getCost(hw.costs?.insuranceCost)}</p>
              </>
            ) : (
              <p>Renewal: {getCost(sw.costs?.renewalCost)}</p>
            )}
          </div>

          {/* QR */}
          {isHardware && qrUrl && (
            <div className="card-box center">
              <h5>QR</h5>
              <img src={qrUrl} alt="QR" />
            </div>
          )}

          {/* ASSIGNMENT */}
          {isAssigned && (
            <div className="card-box highlight">
              <h5>Assigned To</h5>
              <p>{assignment.employee?.name}</p>
              <p>{assignment.department?.name}</p>
              <p>{assignment.location}</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="card-footer">
        <button onClick={() => onEdit(inst)}>✏ Edit</button>
      </div>
    </div>
  );
};
export default InstanceCard