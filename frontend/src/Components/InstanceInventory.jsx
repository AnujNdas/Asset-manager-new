import React, { useState } from "react";
import "../Component_styles/TestInstanceInventoryFile.css";
import { useOrganization } from "../Context/OrganizationContext";
const InstanceCard = ({
  inst,
  assignment,
  convertFromBase,
  formatMoney,
  onEdit,
  onDelete,
  onUnassign // ✅ NEW PROP
}) => {
  const { organization } = useOrganization();
  const currency = organization?.currency;

  const [loading, setLoading] = useState(false);

  const isAssigned = !!assignment;
  const isHardware = inst.assetType === "hardware";

  const hw = inst.hardware || {};
  const sw = inst.software || {};

  const qrUrl = inst.qrCode?.url || hw.qrCode?.url;

/* ================= COST HELPERS ================= */


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

const getActiveDays = (inst) => {
  let startDate = null;
  let endDate = null;

  if (inst.assetType === "hardware") {
    startDate = inst.hardware?.installationDate;
    endDate = inst.hardware?.nextMaintenanceDate;
  } else {
    startDate = inst.software?.installationDate;
    endDate = inst.software?.renewalDate;
  }

  if (!startDate || !endDate) return null;

  return Math.floor(
    (new Date(endDate) - new Date(startDate)) /
      (1000 * 60 * 60 * 24)
  );
};

const getActiveDuration = (inst) => {
  const totalDays = getActiveDays(inst);
  return totalDays === null ? "N/A" : `${totalDays} Days`;
};

const getDurationClass = (inst) => {
  const days = getActiveDays(inst);

  if (days === null) return "duration-na";

  if (days < 100) return "duration-danger";

  if (days < 300) return "duration-warning";

  return "duration-safe";
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
const handleDelete = () => {
  if (!onDelete) return;

  onDelete(inst._id)
};
  return (
//     <div className="instance-card-v2">

//       {/* ================= HEADER ================= */}
//       <div className="card-header">
//         <div>
//           <h3>{inst.deviceName}</h3>
//           <p className="sub">{inst.instanceCode}</p>
//           <p className="sub">
//             {isHardware
//               ? hw.serialNumber || "No Serial"
//               : `🔑 ${sw.licenseNumber || "No License"}`}
//           </p>
//         </div>
//         <div style={{ display: "flex" , flexDirection: "column", gap: "8px" }}>
//         <span className={`status ${isAssigned ? "assigned" : "free"}`}>
//           {isAssigned ? "Assigned" : "Available"}
//         </span>
// <span
//   className={`type-badge ${getDurationClass(inst)}`}
// >
//   {getActiveDuration(inst)}
// </span>
//         </div>
//       </div>

//       {/* ================= KPI STRIP ================= */}
// <div className="kpi-strip">
//   <div>
//     <p>Purchase</p>
//     <h4>
//       {formatMoney
//         ? formatMoney(purchase, currency)
//         : `${currency} ${purchase.toFixed(2)}`}
//     </h4>
//   </div>

//   <div>
//     <p>Yearly</p>
//     <h4>
//       {formatMoney
//         ? formatMoney(yearly, currency)
//         : `${currency} ${yearly.toFixed(2)}`}
//     </h4>
//   </div>

//   <div>
//     <p>Monthly</p>
//     <h4>
//       {formatMoney
//         ? formatMoney(monthly, currency)
//         : `${currency} ${monthly.toFixed(2)}`}
//     </h4>
//   </div>

//   <div>
//     <p>Location</p>
//     <h4>{inst.location || "N/A"}</h4>
//   </div>
// </div>

//       {/* ================= BODY GRID ================= */}
//       <div className="card-grid">

//         {/* LEFT COLUMN */}
//         <div className="col">

//           {/* HARDWARE */}
//           {isHardware && (
//             <>
//               <div className="card-box">
//                 <h5>Technical</h5>
//                 <p><span>Model :</span> {hw.modelNo || "N/A"}</p>
//                 <p><span>Specs :</span> {hw.specifications || "N/A"}</p>
//               </div>

//               <div className="card-box">
//                 <h5>Lifecycle</h5>
//                 <p><span>Purchase Date :</span> {formatDate(hw.purchaseDate)}</p>
//                 <p><span>Next Maintenance Date :</span> {formatDate(hw.nextMaintenanceDate)}</p>
//                 <p><span>Warranty Expiry :</span> {formatDate(hw.warrantyExpiry)}</p>
//                 <p><span>Insurance Expiry :</span> {formatDate(hw.insuranceExpiry || "N/A")}</p>
//               </div>
//             </>
//           )}

//           {/* SOFTWARE */}
//           {!isHardware && (
//             <>
//               <div className="card-box">
//                 <h5>License</h5>
//                 <p><span>Key :</span> {sw.licenseKey || "N/A"}</p>
//                 <p><span>Number :</span> {sw.licenseNumber || "N/A"}</p>
//               </div>

//               <div className="card-box">
//                 <h5>Validity</h5>
//                 <p><span>Expiry Date :</span> {formatDate(sw.renewalDate)}</p>
//                 {/* <p><span>Last Used Date:</span> {formatDate(sw.lastUsedDate)}</p> */}
//               </div>
//             </>
//           )}

//           {isHardware && qrUrl && (
//             <div className="card-box center">
//               <h5>QR</h5>

//               <img src={qrUrl} alt="QR" />

//               <button
//                 className="print-qr-btn"
//                 onClick={handlePrintQR}
//               >
//                 🖨 Print QR
//               </button>
//             </div>
//           )}

//         </div>

//         {/* RIGHT COLUMN */}
//         <div className="col">

//           {/* COST */}
// <div className="card-box">
//   <h5>Cost Breakdown</h5>

//   {isHardware ? (
//     <>
//       <p>
//         Maintenance :
//         <span>
//           {formatMoney
//             ? formatMoney(
//                 hw.costs?.maintenanceCost?.amount || 0,
//                 currency
//               )
//             : `${currency} ${(
//                 hw.costs?.maintenanceCost?.amount || 0
//               ).toFixed(2)}`}
//         </span>
//       </p>

//       <p>
//         Warranty :
//         <span>
//           {formatMoney
//             ? formatMoney(
//                 hw.costs?.warrantyRenewalCost?.amount || 0,
//                 currency
//               )
//             : `${currency} ${(
//                 hw.costs?.warrantyRenewalCost?.amount || 0
//               ).toFixed(2)}`}
//         </span>
//       </p>

//       <p>
//         Insurance :
//         <span>
//           {hw.costs?.insuranceCost
//             ? formatMoney
//               ? formatMoney(
//                   hw.costs.insuranceCost.amount || 0,
//                   currency
//                 )
//               : `${currency} ${(
//                   hw.costs.insuranceCost.amount || 0
//                 ).toFixed(2)}`
//             : "N/A"}
//         </span>
//       </p>
//     </>
//   ) : (
//     <p>
//       Renewal :
//       <span>
//         {formatMoney
//           ? formatMoney(yearly, currency)
//           : `${currency} ${yearly.toFixed(2)}`}
//       </span>
//     </p>
//   )}
// </div>

//           {/* ASSIGNMENT */}
//           {isAssigned && (
//             <div className="card-box highlight">
//               <h5>Assigned To</h5>

//               <p>{assignment.employee?.name}</p>
//               <p>{assignment.department?.name}</p>
//               <p>{assignment.location}</p>

//               {/* ✅ UNASSIGN BUTTON */}
//               <button
//                 className="unassign-btn"
//                 onClick={handleUnassign}
//                 disabled={loading}
//               >
//                 {loading ? "Unassigning..." : "↩ Unassign"}
//               </button>
//             </div>
//           )}

//           {isHardware && (
//             <div className="card-box">
//               <h5>Coverage Type</h5>

//               <div className="coverage-tags">
//                 {hw.coverageType?.length ? (
//                   hw.coverageType.map((type, i) => (
//                     <div key={i} className="tag">
//                       {type}
//                     </div>
//                   ))
//                 ) : (
//                   <div className="no-data">N/A</div>
//                 )}
//               </div>
//             </div>
//           )}

//         </div>
//       </div>

//       {/* ================= FOOTER ================= */}
// <div className="card-footer">

//   <button
//     className="edit-btn"
//     onClick={() => onEdit(inst)}
//   >
//     ✏ Edit
//   </button>

//   <button
//     className="delete-btn"
//     onClick={handleDelete}
//   >
//     🗑 Delete
//   </button>

// </div>
//     </div>

<div
  className={`instance-card ${
    isAssigned ? "instance-is-assigned" : ""
  }`}
>
  {/* =====================================================
      HEADER
  ===================================================== */}
  <div className="instance-header">

    <div className="instance-identity">
      <div className="instance-icon">
        {isHardware ? "H" : "S"}
      </div>

      <div className="instance-title">
        <span className="instance-eyebrow">
          {isHardware ? "HARDWARE INSTANCE" : "SOFTWARE LICENSE"}
        </span>

        <h3 title={inst.deviceName}>
          {inst.deviceName || "Unnamed Instance"}
        </h3>

        <div className="instance-identifiers">
          <span>{inst.instanceCode}</span>

          <span className="identifier-divider"></span>

          <span>
            {isHardware
              ? hw.serialNumber || "No serial number"
              : sw.licenseNumber || "No license number"}
          </span>
        </div>
      </div>
    </div>


    <div className="instance-header-badges">

      <span
        className={`instance-status ${
          isAssigned ? "assigned" : "available"
        }`}
      >
        <span className="instance-status-dot"></span>

        {isAssigned ? "Assigned" : "Available"}
      </span>

      <span
        className={`instance-duration ${getDurationClass(inst)}`}
      >
        {getActiveDuration(inst)}
      </span>

    </div>
  </div>


  {/* =====================================================
      KPI STRIP
  ===================================================== */}
  <div className="instance-kpi-grid">

    <div className="instance-kpi">
      <span className="instance-kpi-label">
        Purchase
      </span>

      <strong>
        {formatMoney
          ? formatMoney(purchase, currency)
          : `${currency} ${purchase.toFixed(2)}`}
      </strong>
    </div>


    <div className="instance-kpi">
      <span className="instance-kpi-label">
        Yearly
      </span>

      <strong>
        {formatMoney
          ? formatMoney(yearly, currency)
          : `${currency} ${yearly.toFixed(2)}`}
      </strong>
    </div>


    <div className="instance-kpi">
      <span className="instance-kpi-label">
        Monthly
      </span>

      <strong>
        {formatMoney
          ? formatMoney(monthly, currency)
          : `${currency} ${monthly.toFixed(2)}`}
      </strong>
    </div>


    <div className="instance-kpi">
      <span className="instance-kpi-label">
        Location
      </span>

      <strong title={inst.location}>
        {inst.location || "Not set"}
      </strong>
    </div>

  </div>


  {/* =====================================================
      CONTENT
  ===================================================== */}
  <div className="instance-content-grid">

    {/* ===================================================
        LEFT
    =================================================== */}
    <div className="instance-column">

      {/* ================= HARDWARE ================= */}
      {isHardware && (
        <>
          {/* TECHNICAL */}
          <section className="instance-section">

            <div className="instance-section-header">
              <div className="instance-section-icon">
                01
              </div>

              <div>
                <h4>Technical Details</h4>
                <p>Device identification and specifications</p>
              </div>
            </div>


            <div className="instance-detail-list">

              <div className="instance-detail-row">
                <span>Model</span>

                <strong>
                  {hw.modelNo || "Not available"}
                </strong>
              </div>


              <div className="instance-detail-row">
                <span>Specifications</span>

                <strong title={hw.specifications}>
                  {hw.specifications || "Not available"}
                </strong>
              </div>

            </div>
          </section>


          {/* LIFECYCLE */}
          <section className="instance-section">

            <div className="instance-section-header">
              <div className="instance-section-icon">
                02
              </div>

              <div>
                <h4>Lifecycle</h4>
                <p>Important asset dates</p>
              </div>
            </div>


            <div className="instance-detail-list">

              <div className="instance-detail-row">
                <span>Purchase Date</span>

                <strong>
                  {formatDate(hw.purchaseDate)}
                </strong>
              </div>


              <div className="instance-detail-row">
                <span>Next Maintenance</span>

                <strong>
                  {formatDate(hw.nextMaintenanceDate)}
                </strong>
              </div>


              <div className="instance-detail-row">
                <span>Warranty Expiry</span>

                <strong>
                  {formatDate(hw.warrantyExpiry)}
                </strong>
              </div>


              <div className="instance-detail-row">
                <span>Insurance Expiry</span>

                <strong>
                  {hw.insuranceExpiry
                    ? formatDate(hw.insuranceExpiry)
                    : "Not available"}
                </strong>
              </div>

            </div>
          </section>
        </>
      )}


      {/* ================= SOFTWARE ================= */}
      {!isHardware && (
        <>
          {/* LICENSE */}
          <section className="instance-section">

            <div className="instance-section-header">
              <div className="instance-section-icon">
                01
              </div>

              <div>
                <h4>License Details</h4>
                <p>Software license identification</p>
              </div>
            </div>


            <div className="instance-detail-list">

              <div className="instance-detail-row">
                <span>License Key</span>

                <strong
                  className="instance-sensitive-value"
                  title={sw.licenseKey}
                >
                  {sw.licenseKey || "Not available"}
                </strong>
              </div>


              <div className="instance-detail-row">
                <span>License Number</span>

                <strong title={sw.licenseNumber}>
                  {sw.licenseNumber || "Not available"}
                </strong>
              </div>

            </div>
          </section>


          {/* VALIDITY */}
          <section className="instance-section">

            <div className="instance-section-header">
              <div className="instance-section-icon">
                02
              </div>

              <div>
                <h4>Validity</h4>
                <p>License renewal information</p>
              </div>
            </div>


            <div className="instance-detail-list">

              <div className="instance-detail-row">
                <span>Expiry Date</span>

                <strong>
                  {formatDate(sw.renewalDate)}
                </strong>
              </div>

            </div>
          </section>
        </>
      )}


      {/* ================= QR ================= */}
      {isHardware && qrUrl && (
        <section className="instance-section instance-qr-section">

          <div className="instance-section-header">
            <div className="instance-section-icon">
              QR
            </div>

            <div>
              <h4>Asset QR Code</h4>
              <p>Scan to identify this asset instance</p>
            </div>
          </div>


          <div className="instance-qr-content">

            <div className="instance-qr-image">
              <img
                src={qrUrl}
                alt={`QR code for ${inst.instanceCode}`}
              />
            </div>


            <div className="instance-qr-info">
              <span>INSTANCE CODE</span>

              <strong>
                {inst.instanceCode}
              </strong>

              <p>
                Print and attach this QR code to the
                physical asset for faster identification.
              </p>

              <button
                type="button"
                className="instance-print-btn"
                onClick={handlePrintQR}
              >
                Print QR
              </button>
            </div>

          </div>
        </section>
      )}

    </div>


    {/* ===================================================
        RIGHT
    =================================================== */}
    <div className="instance-column">

      {/* ================= COST ================= */}
      <section className="instance-section">

        <div className="instance-section-header">
          <div className="instance-section-icon">
            {isHardware ? "03" : "03"}
          </div>

          <div>
            <h4>Cost Breakdown</h4>

            <p>
              {isHardware
                ? "Lifecycle expenditure"
                : "License expenditure"}
            </p>
          </div>
        </div>


        <div className="instance-cost-list">

          {isHardware ? (
            <>
              <div className="instance-cost-row">
                <span>Maintenance</span>

                <strong>
                  {formatMoney
                    ? formatMoney(
                        hw.costs?.maintenanceCost?.amount || 0,
                        currency
                      )
                    : `${currency} ${(
                        hw.costs?.maintenanceCost?.amount || 0
                      ).toFixed(2)}`}
                </strong>
              </div>


              <div className="instance-cost-row">
                <span>Warranty</span>

                <strong>
                  {formatMoney
                    ? formatMoney(
                        hw.costs?.warrantyRenewalCost?.amount || 0,
                        currency
                      )
                    : `${currency} ${(
                        hw.costs?.warrantyRenewalCost?.amount || 0
                      ).toFixed(2)}`}
                </strong>
              </div>


              <div className="instance-cost-row">
                <span>Insurance</span>

                <strong>
                  {hw.costs?.insuranceCost
                    ? formatMoney
                      ? formatMoney(
                          hw.costs.insuranceCost.amount || 0,
                          currency
                        )
                      : `${currency} ${(
                          hw.costs.insuranceCost.amount || 0
                        ).toFixed(2)}`
                    : "Not available"}
                </strong>
              </div>
            </>
          ) : (
            <div className="instance-cost-row">
              <span>Annual Renewal</span>

              <strong>
                {formatMoney
                  ? formatMoney(yearly, currency)
                  : `${currency} ${yearly.toFixed(2)}`}
              </strong>
            </div>
          )}

        </div>
      </section>


      {/* ================= ASSIGNMENT ================= */}
      {isAssigned && (
        <section className="instance-section instance-assignment-section">

          <div className="instance-section-header">

            <div className="instance-section-icon">
              A
            </div>

            <div>
              <h4>Assigned To</h4>
              <p>Current asset holder</p>
            </div>

          </div>


          <div className="assignment-profile">

            <div className="assignment-avatar">
              {assignment.employee?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>


            <div className="assignment-person">

              <strong>
                {assignment.employee?.name ||
                  "Unknown employee"}
              </strong>

              <span>
                {assignment.department?.name ||
                  "No department"}
              </span>

            </div>

          </div>


          <div className="instance-detail-list assignment-details">

            <div className="instance-detail-row">
              <span>Department</span>

              <strong>
                {assignment.department?.name ||
                  "Not available"}
              </strong>
            </div>


            <div className="instance-detail-row">
              <span>Location</span>

              <strong>
                {assignment.location ||
                  "Not available"}
              </strong>
            </div>

          </div>


          <button
            type="button"
            className="instance-unassign-btn"
            onClick={handleUnassign}
            disabled={loading}
          >
            {loading
              ? "Unassigning..."
              : "Unassign Asset"}
          </button>

        </section>
      )}


      {/* ================= COVERAGE ================= */}
      {isHardware && (
        <section className="instance-section">

          <div className="instance-section-header">

            <div className="instance-section-icon">
              04
            </div>

            <div>
              <h4>Coverage</h4>
              <p>Insurance protection</p>
            </div>

          </div>


          {hw.coverageType?.length ? (

            <div className="instance-coverage-tags">

              {hw.coverageType.map((type, i) => (
                <span
                  key={i}
                  className="instance-coverage-tag"
                >
                  {type}
                </span>
              ))}

            </div>

          ) : (

            <div className="instance-no-data">
              No coverage information available
            </div>

          )}

        </section>
      )}

    </div>
  </div>


  {/* =====================================================
      FOOTER
  ===================================================== */}
  <div className="instance-footer">

    <div className="instance-footer-info">
      <span className="instance-footer-dot"></span>

      {isAssigned
        ? "This instance is currently assigned"
        : "This instance is available for assignment"}
    </div>


    <div className="instance-footer-actions">

      <button
        type="button"
        className="instance-edit-btn"
        onClick={() => onEdit(inst)}
      >
        Edit Instance
      </button>


      <button
        type="button"
        className="instance-delete-btn"
        onClick={handleDelete}
      >
        Delete
      </button>

    </div>

  </div>
</div>
  );
};

export default InstanceCard;