import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInstanceData } from "../Services/ApiServices";
import "../Page_styles/TrackInstance.css";
import axios from "axios";
const TrackInstance = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstance();
  }, [id]);

const fetchInstance = async () => {
  try {
    const res = await getInstanceData(id);

    console.log("TRACK DATA:", res.data);

    setData(res.data.data);

  } catch (err) {
    console.error(err);

    // 🔐 Handle unauthorized (important for QR flow)
    if (err.response?.status === 401) {
      window.location.href = `/login?redirect=/track/${id}`;
    } else {
      setData(null);
    }

  } finally {
    setLoading(false);
  }
};

  if (loading) return <div className="track-page">Loading...</div>;

  if (!data)
    return (
      <div className="track-page error">
        <h2>Invalid QR Code</h2>
        <p>This asset could not be found.</p>
      </div>
    );

  const isHardware = data.assetType === "hardware";

  return (
<div className="track-page">
  <div className="track-card">

    {/* HEADER */}
    <div className="track-header">
      <h2>{data.asset?.name || "-"}</h2>
      <span className={`status ${data.status}`}>
        {data.status.replace("_", " ")}
      </span>
    </div>

    {/* ASSET INFO */}
    <div className="section">
      <h3>Asset Info</h3>
      <p><strong>Code:</strong> {data.asset?.code || "-"}</p>
      <p><strong>Type:</strong> {data.assetType}</p>
      <p><strong>Condition:</strong> {data.condition}</p>
    </div>

    {/* LOCATION */}
    <div className="section">
      <h3>Location</h3>
      <p>{data.location || "-"}</p>
    </div>

    {/* ASSIGNMENT */}
    <div className="section">
      <h3>Assignment</h3>
      <p><strong>Employee:</strong> {data.assignment?.employeeName || "Not Assigned"}</p>
      <p><strong>Department:</strong> {data.assignment?.department || "-"}</p>
      <p><strong>Assigned At:</strong> {data.assignment?.assignedAt ? new Date(data.assignment.assignedAt).toLocaleDateString() : "-"}</p>
    </div>

    {/* DEVICE INFO */}
    {isHardware && (
      <div className="section">
        <h3>Hardware Details</h3>
        <p><strong>Model:</strong> {data.hardware?.modelNo || "-"}</p>
        <p><strong>Serial:</strong> {data.hardware?.serialNumber || "-"}</p>
        <p><strong>Purchase Date:</strong> {data.hardware?.purchaseDate ? new Date(data.hardware.purchaseDate).toLocaleDateString() : "-"}</p>
        <p><strong>Installation:</strong> {data.hardware?.installationDate ? new Date(data.hardware.installationDate).toLocaleDateString() : "-"}</p>
      </div>
    )}

    {!isHardware && (
      <div className="section">
        <h3>Software Details</h3>
        <p><strong>License Number:</strong> {data.software?.licenseNumber || "-"}</p>
      </div>
    )}

    {/* WARRANTY / INSURANCE */}
    {isHardware && (
      <div className="section">
        <h3>Warranty & Insurance</h3>
        <p><strong>Warranty Expiry:</strong> {data.hardware?.warrantyExpiry ? new Date(data.hardware.warrantyExpiry).toLocaleDateString() : "-"}</p>
        <p><strong>Insurance Expiry:</strong> {data.hardware?.insuranceExpiry ? new Date(data.hardware.insuranceExpiry).toLocaleDateString() : "-"}</p>
        <p><strong>Next Maintenance:</strong> {data.hardware?.nextMaintenanceDate ? new Date(data.hardware.nextMaintenanceDate).toLocaleDateString() : "-"}</p>
      </div>
    )}

    {/* COVERAGE */}
    {isHardware && (
      <div className="section">
        <h3>Coverage</h3>
        <p>
          {data.hardware?.coverageType?.length
            ? data.hardware.coverageType.join(", ")
            : "-"}
        </p>
      </div>
    )}

    {/* COST */}
    <div className="section">
      <h3>Financial</h3>
      <p>
        <strong>Purchase Cost:</strong>{" "}
        {data.hardware?.purchaseCost
          ? `${data.hardware.purchaseCost.currency} ${data.hardware.purchaseCost.amount}`
          : "-"}
      </p>
    </div>

  </div>
</div>
  );
};

export default TrackInstance;