import React from "react";
import { useEffect } from "react";
import { useTour } from "../Context/TourContext";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { CURRENCY_SYMBOLS } from "../utils/currency.js";
import { useOrganization } from "../Context/OrganizationContext";
const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return isNaN(d) ? "-" : d.toLocaleDateString();
};



const InstanceCard = ({ instance, onReassign, onHistory, onUpgrade }) => {
  const { organization } = useOrganization();
  const currency = organization?.currency || "USD";
  const currencySymbol = CURRENCY_SYMBOLS[currency] || "$";
  // console.log("Rendering InstanceCard for:", instance);
  const { registerTour } = useTour();
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
  
      overlayColor: "rgba(0,0,0,0.75)",
  
      popoverClass: "custom-driver-popover",
  
      steps: [
        {
          element: ".tour-card",
          popover: {
            title: "Instance Card",
            description: "Each card Contains Instance related data.",
            side: "bottom",
            align: "start",
          },
        },
  
        {
          element: ".tour-reassign",
          popover: {
            title: "Reassign Instance",
            description:
              "Click and reassign instance to team members.",
            side: "bottom",
          },
        },
        {
          element: ".tour-history",
          popover: {
            title: "History Tracking",
            description:
              "Check history for the instances.",
            side: "bottom",
          },
        },
        {
          element: ".tour-upgrade",
          popover: {
            title: "Upgrade Instance",
            description:
              "Cost related Upgrades can be done from here.",
            side: "bottom",
          },
        },
      ],
    });
    //   useEffect(() => {
    //     const seen = localStorage.getItem("inventoryTourSeen");
      
    //     if (!seen) {
    //       setTimeout(() => {
    //         driverObj.drive();
      
    //         localStorage.setItem(
    //           "inventoryTourSeen",
    //           "true"
    //         );
    //       }, 1000);
    //     }
    //   }, []);
    //   useEffect(() => {
    //   registerTour(driverObj);
    // }, []);
  const isHardware = instance.assetType === "hardware";
  const isSoftware = instance.assetType === "software";

  const hw = instance.hardware || {};
  const sw = instance.software || {};
  const assignment = instance.assignment;
  // console.log(instance.assignment);

  // Get all upgrade lifecycle entries
const upgradeEvents =
  instance.lifecycle?.filter(
    (item) => item.eventType === "upgraded"
  ) || [];

// Latest upgrade
const latestUpgrade =
  upgradeEvents.length > 0
    ? upgradeEvents[upgradeEvents.length - 1]
    : null;

// Latest upgrade cost
const latestUpgradeCost =
  latestUpgrade?.metadata?.upgradeCost?.amount || 0;
// Total upgrade cost
const totalUpgradeCost = upgradeEvents.reduce(
  (sum, event) =>
    sum +
    (event?.metadata?.upgradeCost?.amount || 0),
  0
);
  return (
//     <div className="instance-card tour-card">

//       <div className="instance-grid">

//         <div>
//           <p className="label">Instance Code</p>
//           <p className="value">{instance.instanceCode}</p>
//         </div>
//         <div>
//           <p className="label">Instance Name</p>
//           <p className="value">{instance.deviceName}</p>
//         </div>

//         {/* UNIQUE IDENTIFIER */}
//         <div>
//           <p className="label">
//             {isSoftware ? "License Number" : "Model No"}
//           </p>
//           <p className="value">
//             {isSoftware
//               ? sw.licenseNumber || "-"
//               : hw.modelNo || "-"}
//           </p>
//         </div>

//         {/* COST (PRIMARY) */}
//         <div>
//           <p className="label">
//             {isSoftware ? "Renewal Cost" : "Maintenance Cost"}
//           </p>
//           <p className="value">
//             {isSoftware
//             ? `${currencySymbol} ${sw.costs?.renewalCost?.amount}`
//             : `${currencySymbol} ${hw.costs?.maintenanceCost?.amount}`}
//           </p>
//         </div>

//         {/* WARRANTY COST */}
//         {isHardware && (
//           <div>
//             <p className="label">Warranty Cost</p>
//             <p className="value">
//               {currencySymbol} {hw.costs?.warrantyRenewalCost?.amount}
//             </p>
//           </div>
//         )}

//         {/* INSURANCE COST */}
//         {isHardware && (
//           <div>
//             <p className="label">Insurance Cost</p>
//             <p className="value">
//               {currencySymbol} {hw.costs?.insuranceCost?.amount}
//             </p>
//           </div>
//         )}

//         {/* PURCHASE COST */}
//         <div>
//           <p className="label">Purchase Cost</p>
//           <p className="value">
//             {isSoftware
//               ? `${currencySymbol} ${sw.purchaseCost?.amount}`
//               : `${currencySymbol} ${hw.purchaseCost?.amount}`}
//           </p>
//         </div>

//         {/* WARRANTY / RENEWAL DATE */}
//         <div>
//           <p className="label">
//             {isSoftware ? "Renewal Date" : "Warranty Expiry"}
//           </p>
//           <p className="value">
//             {isSoftware
//               ? formatDate(sw.renewalDate)
//               : formatDate(hw.warrantyExpiry)}
//           </p>
//         </div>

//         {/* INSTALLATION */}
//         <div>
//           <p className="label">Installation Date</p>
//           <p className="value">
//             {formatDate(
//               isSoftware
//                 ? sw.installationDate
//                 : hw.installationDate
//             )}
//           </p>
//         </div>

//         {/* INSURANCE EXPIRY */}
//         {isHardware && (
//           <div>
//             <p className="label">Insurance Expiry</p>
//             <p className="value">
//               {formatDate(hw.insuranceExpiry)}
//             </p>
//           </div>
//         )}

//         {/* ASSIGNED PERSON */}
//         <div>
//           <p className="label">Assigned To</p>
//           <p className="value">
//             {assignment?.employee?.name || "Not Assigned"}
//           </p>
//         </div>

//         {/* DEPARTMENT */}
//         <div>
//           <p className="label">Department</p>
//           <p className="value">
//             {assignment?.department?.name || "-"}
//           </p>
//         </div>

//         {/* DEVICE INFO */}
//         <div>
//           <p className="label">Device</p>
//           <p className="value">
//             {assignment?.deviceInfo?.deviceName || "-"}
//           </p>
//         </div>

//         {/* LOCATION */}
//         <div>
//           <p className="label">Location</p>
//           <p className="value">
//             {assignment?.location || instance.location || "-"}
//           </p>
//         </div>
//         {/* LAST UPGRADE COST */}
// <div>
//   <p className="label">Last Upgrade Cost</p>
//   <p className="value">
//     {currencySymbol} {latestUpgradeCost}
//   </p>
// </div>

// {/* TOTAL UPGRADE COST */}
// <div>
//   <p className="label">Total Upgrade Cost</p>
//   <p className="value">
//     {currencySymbol} {totalUpgradeCost}
//   </p>
// </div>


// {/* LAST UPGRADE DATE */}
// <div>
//   <p className="label">Last Upgrade Date</p>
//   <p className="value">
//     {formatDate(latestUpgrade?.date)}
//   </p>
// </div>

//       </div>

//       {/* ACTIONS */}
//       <div className="actions">
//         <button className="btn btn-blue tour-reassign" onClick={() => onReassign(instance)}>
//           Reassign
//         </button>

//         <button className="btn btn-blue tour-history" onClick={() => onHistory(instance)}>
//           History
//         </button>

//         <button className="btn btn-blue tour-upgrade" onClick={() => onUpgrade(instance)}>
//           Upgrade
//         </button>
//       </div>
//                 {/* INSTANCE CODE */}
//         {/* QR CODE */}
// {/* {isHardware && instance.qrCode?.url && (
//   <div className="qr-section">
//     <p className="label">QR Code</p>

//     <a
//       href={instance.trackingUrl}
//       target="_blank"
//       rel="noopener noreferrer"
//     >
//       <img
//         src={instance.qrCode.url}
//         alt="QR Code"
//         className="qr-image"
//       />
//     </a>

//     <div className="qr-actions">
//       <a
//         href={instance.qrCode.url}
//         download
//         className="btn btn-small"
//       >
//         Download
//       </a>

//       <a
//         href={instance.trackingUrl}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="btn btn-small btn-blue"
//       >
//         Open Link
//       </a>
//     </div>
//   </div>
// )} */}
//     </div>


<div className="tracking-card tour-card">

  {/* =====================================================
      HEADER
  ===================================================== */}
  <div className="tracking-card-header">

    <div className="tracking-card-identity">

      <div
        className={`tracking-card-type-icon ${
          isSoftware ? "software" : "hardware"
        }`}
      >
        {isSoftware ? "S" : "H"}
      </div>

      <div className="tracking-card-title">
        <span className="tracking-card-eyebrow">
          {isSoftware ? "SOFTWARE INSTANCE" : "HARDWARE INSTANCE"}
        </span>

        <h3 title={instance.deviceName}>
          {instance.deviceName || "Unnamed Instance"}
        </h3>

        <span className="tracking-instance-code">
          {instance.instanceCode}
        </span>
      </div>

    </div>


    {/* STATUS */}
    <div className="tracking-card-statuses">

      <span
        className={`tracking-type-badge ${
          isSoftware ? "software" : "hardware"
        }`}
      >
        {isSoftware ? "Software" : "Hardware"}
      </span>

      <span
        className={`tracking-assignment-badge ${
          assignment ? "assigned" : "available"
        }`}
      >
        <span className="tracking-status-dot" />

        {assignment ? "Assigned" : "Available"}
      </span>

    </div>

  </div>


  {/* =====================================================
      KPI / COST STRIP
  ===================================================== */}
  <div className="tracking-kpi-strip">

    <div className="tracking-kpi-item">
      <span>Purchase Cost</span>

      <strong>
        {currencySymbol}{" "}
        {isSoftware
          ? sw.purchaseCost?.amount ?? 0
          : hw.purchaseCost?.amount ?? 0}
      </strong>
    </div>


    <div className="tracking-kpi-item">
      <span>
        {isSoftware
          ? "Renewal Cost"
          : "Maintenance Cost"}
      </span>

      <strong>
        {currencySymbol}{" "}
        {isSoftware
          ? sw.costs?.renewalCost?.amount ?? 0
          : hw.costs?.maintenanceCost?.amount ?? 0}
      </strong>
    </div>


    <div className="tracking-kpi-item">
      <span>Last Upgrade</span>

      <strong>
        {currencySymbol} {latestUpgradeCost ?? 0}
      </strong>
    </div>


    <div className="tracking-kpi-item">
      <span>Total Upgrade</span>

      <strong>
        {currencySymbol} {totalUpgradeCost ?? 0}
      </strong>
    </div>

  </div>


  {/* =====================================================
      DETAIL SECTIONS
  ===================================================== */}
  <div className="tracking-details-grid">


    {/* ===================================================
        ASSET INFORMATION
    =================================================== */}
    <div className="tracking-detail-section">

      <div className="tracking-section-header">
        <span>INSTANCE</span>
        <h4>Asset Information</h4>
      </div>

      <div className="tracking-detail-list">

        <div className="tracking-detail-row">
          <span>
            {isSoftware
              ? "License Number"
              : "Model Number"}
          </span>

          <strong>
            {isSoftware
              ? sw.licenseNumber || "-"
              : hw.modelNo || "-"}
          </strong>
        </div>


        <div className="tracking-detail-row">
          <span>Installation Date</span>

          <strong>
            {formatDate(
              isSoftware
                ? sw.installationDate
                : hw.installationDate
            )}
          </strong>
        </div>


        <div className="tracking-detail-row">
          <span>Location</span>

          <strong>
            {assignment?.location ||
              instance.location ||
              "-"}
          </strong>
        </div>


        <div className="tracking-detail-row">
          <span>Last Upgrade</span>

          <strong>
            {formatDate(latestUpgrade?.date)}
          </strong>
        </div>

      </div>

    </div>


    {/* ===================================================
        LIFECYCLE / FINANCIAL
    =================================================== */}
    <div className="tracking-detail-section">

      <div className="tracking-section-header">
        <span>LIFECYCLE</span>

        <h4>
          {isSoftware
            ? "License & Renewal"
            : "Warranty & Coverage"}
        </h4>
      </div>


      <div className="tracking-detail-list">

        {isSoftware ? (
          <>
            <div className="tracking-detail-row">
              <span>Renewal Date</span>

              <strong>
                {formatDate(sw.renewalDate)}
              </strong>
            </div>


            <div className="tracking-detail-row">
              <span>Renewal Cost</span>

              <strong>
                {currencySymbol}{" "}
                {sw.costs?.renewalCost?.amount ?? 0}
              </strong>
            </div>
          </>
        ) : (
          <>
            <div className="tracking-detail-row">
              <span>Warranty Expiry</span>

              <strong>
                {formatDate(hw.warrantyExpiry)}
              </strong>
            </div>


            <div className="tracking-detail-row">
              <span>Warranty Cost</span>

              <strong>
                {currencySymbol}{" "}
                {hw.costs?.warrantyRenewalCost?.amount ?? 0}
              </strong>
            </div>


            <div className="tracking-detail-row">
              <span>Insurance Expiry</span>

              <strong>
                {formatDate(hw.insuranceExpiry)}
              </strong>
            </div>


            <div className="tracking-detail-row">
              <span>Insurance Cost</span>

              <strong>
                {currencySymbol}{" "}
                {hw.costs?.insuranceCost?.amount ?? 0}
              </strong>
            </div>
          </>
        )}

      </div>

    </div>


    {/* ===================================================
        ASSIGNMENT
    =================================================== */}
    <div
      className={`tracking-detail-section tracking-assignment-section ${
        assignment ? "has-assignment" : ""
      }`}
    >

      <div className="tracking-section-header">
        <span>OWNERSHIP</span>
        <h4>Assignment</h4>
      </div>


      {assignment ? (

        <div className="tracking-detail-list">

          <div className="tracking-detail-row">
            <span>Assigned To</span>

            <strong>
              {assignment.employee?.name || "-"}
            </strong>
          </div>


          <div className="tracking-detail-row">
            <span>Department</span>

            <strong>
              {assignment.department?.name || "-"}
            </strong>
          </div>


          <div className="tracking-detail-row">
            <span>Device</span>

            <strong>
              {assignment.deviceInfo?.deviceName || "-"}
            </strong>
          </div>


          <div className="tracking-detail-row">
            <span>Location</span>

            <strong>
              {assignment.location ||
                instance.location ||
                "-"}
            </strong>
          </div>

        </div>

      ) : (

        <div className="tracking-unassigned">

          <span className="tracking-unassigned-dot" />

          <div>
            <strong>Not Assigned</strong>
            <p>
              This instance is currently available.
            </p>
          </div>

        </div>

      )}

    </div>

  </div>


  {/* =====================================================
      FOOTER / ACTIONS
  ===================================================== */}
  <div className="tracking-card-footer">

    <div className="tracking-card-footer-info">
      <span className="tracking-footer-dot" />

      {assignment
        ? `Assigned to ${assignment.employee?.name || "employee"}`
        : "Instance available for assignment"}
    </div>


    <div className="tracking-card-actions">

      <button
        type="button"
        className="tracking-action-btn tour-history"
        onClick={() => onHistory(instance)}
      >
        History
      </button>


      <button
        type="button"
        className="tracking-action-btn tour-upgrade"
        onClick={() => onUpgrade(instance)}
      >
        Upgrade
      </button>


      <button
        type="button"
        className="tracking-action-btn primary tour-reassign"
        onClick={() => onReassign(instance)}
      >
        Reassign
        <span>→</span>
      </button>

    </div>

  </div>

</div>
  );
};

export default InstanceCard;