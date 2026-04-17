import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTrackedInstancePublic } from "../Services/ApiServices";
import "../Page_styles/TrackInstance.css";
import axios from "axios";
const TrackInstance = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstance();
  }, [id]);

  const fetchInstance = async (id) => {
    try {
      const res = await axios.get(`/api/tracking/${id}`);
      console.log(res.data);
    return res.data;
      setData(res.data);
    } catch (err) {
      setData(null);
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

        <h2>{data.instanceCode}</h2>

        <span className={`status ${data.status}`}>
          {data.status.replace("_", " ")}
        </span>

        <div className="section">
          <h3>Location</h3>
          <p>{data.location || "-"}</p>
        </div>

        <div className="section">
          <h3>Assigned To</h3>
          <p>{data.assignment?.employeeName || "Not Assigned"}</p>
          <small>{data.assignment?.department || ""}</small>
        </div>

        {isHardware && (
          <div className="section">
            <h3>Device Info</h3>
            <p><strong>Model:</strong> {data.hardware?.modelNo || "-"}</p>
            <p><strong>Serial:</strong> {data.hardware?.serialNumber || "-"}</p>
          </div>
        )}

        {!isHardware && (
          <div className="section">
            <h3>License Info</h3>
            <p>{data.software?.licenseNumber || "-"}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default TrackInstance;