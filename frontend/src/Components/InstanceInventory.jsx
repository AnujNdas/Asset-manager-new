import React, { useState } from "react";
import "../Component_styles/InstanceInventory.css";

const InstanceCard = ({
  inst,
  assignment,
  convertFromBase,
  formatMoney,
  onEdit,
  onUnassign // ✅ NEW PROP
}) => {

  const [loading, setLoading] = useState(false);

  const isAssigned = !!assignment;
  const isHardware = inst.assetType === "hardware";

  const hw = inst.hardware || {};
  const sw = inst.software || {};

  const qrUrl = inst.qrCode?.url || hw.qrCode?.url;

/* ================= COST HELPERS ================= */

const currency =
  hw.purchaseCost?.currency ||
  sw.purchaseCost?.currency ||
  "USD";

const formatCostValue = (costObj) => {
  if (!costObj) {
    return formatMoney
      ? formatMoney(0, currency)
      : `${currency} 0`;
  }

  const value = convertFromBase
    ? Number(convertFromBase(costObj.baseAmount || 0))
    : Number(costObj.amount || 0);

  return formatMoney
    ? formatMoney(value, currency)
    : `${currency} ${value.toFixed(2)}`;
};

/* ================= COST LOGIC ================= */

const purchase = isHardware
  ? hw.purchaseCost.amount || 0
  : sw.purchaseCost.amount || 0;

const yearly = isHardware
  ? (hw.costs?.maintenanceCost?.amount ||
    0) +
    (hw.costs?.insuranceCost?.amount ||
      0) +
    (hw.costs?.warrantyRenewalCost?.amount ||
      0)
  : (sw.costs?.renewalCost?.amount ||
      0);

const monthly = yearly / 12;
  /* ================= DATE HELPERS ================= */
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString() : "N/A";

  const handlePrintQR = () => {
    if (!qrUrl) return;

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: white;
            }

            .print-container {
              text-align: center;
              border: 2px dashed #333;
              padding: 30px;
              border-radius: 12px;
              width: 320px;
            }

            img {
              width: 220px;
              height: 220px;
              object-fit: contain;
              margin-bottom: 15px;
            }

            h2 {
              margin: 0 0 8px;
              font-size: 18px;
            }

            p {
              margin: 4px 0;
              font-size: 14px;
            }
          </style>
        </head>

        <body>
          <div class="print-container">
            <img src="${qrUrl}" />

            <h2>${inst.deviceName || "Hardware Asset"}</h2>

            <p><strong>Instance:</strong> ${inst.instanceCode}</p>

            <p><strong>Serial:</strong> ${
              hw.serialNumber || "N/A"
            }</p>

            <p><strong>Model:</strong> ${
              hw.modelNo || "N/A"
            }</p>
          </div>

          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  /* ================= UNASSIGN ================= */

/* ================= UNASSIGN ================= */

const handleUnassign = async () => {

  if (!onUnassign || !assignment?._id) return;

  try {

    setLoading(true);

    await onUnassign(
      assignment._id
    );

  } catch (err) {

    console.error(err);

  } finally {

    setLoading(false);

  }
};
  return (
    <div className="instance-card-v2">

      {/* ================= HEADER ================= */}
      <div className="card-header">
        <div>
          <h3>{inst.deviceName}</h3>
          <p className="sub">{inst.instanceCode}</p>
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
    <h4>
      {formatMoney
        ? formatMoney(purchase, currency)
        : `${currency} ${purchase.toFixed(2)}`}
    </h4>
  </div>

  <div>
    <p>Yearly</p>
    <h4>
      {formatMoney
        ? formatMoney(yearly, currency)
        : `${currency} ${yearly.toFixed(2)}`}
    </h4>
  </div>

  <div>
    <p>Monthly</p>
    <h4>
      {formatMoney
        ? formatMoney(monthly, currency)
        : `${currency} ${monthly.toFixed(2)}`}
    </h4>
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
                <p><span>Insurance:</span> {formatDate(hw.insuranceExpiry || "N/A")}</p>
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

          {isHardware && qrUrl && (
            <div className="card-box center">
              <h5>QR</h5>

              <img src={qrUrl} alt="QR" />

              <button
                className="print-qr-btn"
                onClick={handlePrintQR}
              >
                🖨 Print QR
              </button>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN */}
        <div className="col">

          {/* COST */}
<div className="card-box">
  <h5>Cost Breakdown</h5>

  {isHardware ? (
    <>
      <p>
        Maintenance:
        <span>
          {formatCostValue(hw.costs?.maintenanceCost?.amount)}
        </span>
      </p>

      <p>
        Warranty:
        <span>
          {formatCostValue(hw.costs?.warrantyRenewalCost?.amount)}
        </span>
      </p>

      <p>
        Insurance:
        <span>
          {hw.costs?.insuranceCost
            ? formatCostValue(hw.costs.insuranceCost?.amount)
            : "N/A"}
        </span>
      </p>
    </>
  ) : (
    <p>
      Renewal:
      <span>
              {formatMoney
        ? formatMoney(yearly, currency)
        : `${currency} ${yearly.toFixed(2)}`}
      </span>
    </p>
  )}
</div>

          {/* ASSIGNMENT */}
          {isAssigned && (
            <div className="card-box highlight">
              <h5>Assigned To</h5>

              <p>{assignment.employee?.name}</p>
              <p>{assignment.department?.name}</p>
              <p>{assignment.location}</p>

              {/* ✅ UNASSIGN BUTTON */}
              <button
                className="unassign-btn"
                onClick={handleUnassign}
                disabled={loading}
              >
                {loading ? "Unassigning..." : "↩ Unassign"}
              </button>
            </div>
          )}

          {isHardware && (
            <div className="card-box">
              <h5>Coverage Type</h5>

              <div className="coverage-tags">
                {hw.coverageType?.length ? (
                  hw.coverageType.map((type, i) => (
                    <div key={i} className="tag">
                      {type}
                    </div>
                  ))
                ) : (
                  <div className="no-data">N/A</div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="card-footer">
        <button onClick={() => onEdit(inst)}>
          ✏ Edit
        </button>
      </div>
    </div>
  );
};

export default InstanceCard;