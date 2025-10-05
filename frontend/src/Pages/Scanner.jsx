import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Swal from "sweetalert2";
import {
  createHardwareAsset,
  createSoftwareAsset,
  createCoreLicense,
} from "../Services/ApiServices";
import "../Page_styles/Scanner.css";

const TABS = ["Hardware", "Software", "Core License"];

const AssetScanner = () => {
  const [activeTab, setActiveTab] = useState("Hardware");
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({});
  const scannerRef = useRef(null);

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // --- Start Scanner ---
  const startScanner = async () => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader");
    }
    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          stopScanner();
          handleScannedData(decodedText);
        }
      );
      setIsScanning(true);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Camera Error",
        text: "Unable to start the camera. Please allow permissions or try another device.",
      });
    }
  };

  // --- Stop Scanner ---
  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop().catch(() => {});
      setIsScanning(false);
    }
  };

  // --- Handle Barcode Scan ---
  const handleScannedData = (code) => {
    setFormData({ assetCode: code });
    Swal.fire({
      icon: "info",
      title: "Barcode Scanned",
      text: `Scanned Code: ${code}. Fill in asset details.`,
    });
  };

  // --- Upload From Gallery ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader");
    }

    scannerRef.current
      .scanFile(file, true)
      .then((decodedText) => {
        handleScannedData(decodedText);
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Scan Failed",
          text: "Could not read barcode from image.",
        });
      });
  };

  // --- Handle Input Change ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Submit New Asset ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === "Hardware") {
        await createHardwareAsset(formData);
      } else if (activeTab === "Software") {
        await createSoftwareAsset(formData);
      } else if (activeTab === "Core License") {
        await createCoreLicense(formData);
      }

      Swal.fire({
        icon: "success",
        title: "Asset Saved",
        text: `${activeTab} asset added successfully!`,
      });

      setFormData({});
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to save ${activeTab} asset.`,
      });
    }
  };

  // --- UI ---
  if (!isMobile) {
    return (
      <div style={{ textAlign: "center", marginTop: "30vh" }}>
        <h2 style={{fontSize : "20px"}}>📱 This page is only accessible on mobile devices.</h2>
      </div>
    );
  }

  return (
    <div className="scanner-page">
      {/* Tabs */}
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scanner Controls */}
      <div className="scanner-controls">
        {!isScanning ? (
          <button onClick={startScanner} className="start-btn">
            Start Scanner
          </button>
        ) : (
          <button onClick={stopScanner} className="stop-btn">
            Stop Scanner
          </button>
        )}
        <label className="upload-btn">
          Upload QR / Barcode
          <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
        </label>
      </div>

      {/* Camera */}
      <div id="reader" style={{ width: "100%", maxWidth: "400px", margin: "auto" }} />

      {/* Form */}
      {formData.assetCode && (
        <form onSubmit={handleSubmit} className="asset-form">
          <h3>{activeTab} Asset Form</h3>
          <input type="text" name="assetCode" value={formData.assetCode || ""} readOnly />
          <input type="text" name="name" placeholder="Asset Name" value={formData.name || ""} onChange={handleChange} />
          <input type="text" name="category" placeholder="Category" value={formData.category || ""} onChange={handleChange} />
          <input type="text" name="location" placeholder="Location" value={formData.location || ""} onChange={handleChange} />
          {activeTab !== "Hardware" && (
            <input type="text" name="licenseKey" placeholder="License Key" value={formData.licenseKey || ""} onChange={handleChange} />
          )}
          <button type="submit">Save Asset</button>
        </form>
      )}
    </div>
  );
};

export default AssetScanner;
