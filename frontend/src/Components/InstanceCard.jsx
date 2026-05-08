import React from "react";
import { useEffect } from "react";
import { useTour } from "../Context/TourContext";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
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
      useEffect(() => {
        const seen = localStorage.getItem("inventoryTourSeen");
      
        if (!seen) {
          setTimeout(() => {
            driverObj.drive();
      
            localStorage.setItem(
              "inventoryTourSeen",
              "true"
            );
          }, 1000);
        }
      }, []);
      useEffect(() => {
      registerTour(driverObj);
    }, []);
  const isHardware = instance.assetType === "hardware";
  const isSoftware = instance.assetType === "software";

  const hw = instance.hardware || {};
  const sw = instance.software || {};
  const assignment = instance.assignment;
  console.log(instance.assignment);
  return (
    <div className="instance-card tour-card">

      <div className="instance-grid">

        <div>
          <p className="label">Instance Code</p>
          <p className="value">{instance.instanceCode}</p>
        </div>
        <div>
          <p className="label">Instance Name</p>
          <p className="value">{instance.deviceName}</p>
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
            {assignment?.department?.name || "-"}
          </p>
        </div>

        {/* DEVICE INFO */}
        <div>
          <p className="label">Device</p>
          <p className="value">
            {assignment?.deviceInfo?.deviceName || "-"}
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
        <button className="btn btn-blue tour-reassign" onClick={() => onReassign(instance)}>
          Reassign
        </button>

        <button className="btn btn-blue tour-history" onClick={() => onHistory(instance)}>
          History
        </button>

        <button className="btn btn-blue tour-upgrade" onClick={() => onUpgrade(instance)}>
          Upgrade
        </button>
      </div>
                {/* INSTANCE CODE */}
        {/* QR CODE */}
{/* {isHardware && instance.qrCode?.url && (
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
)} */}
    </div>
  );
};

export default InstanceCard;