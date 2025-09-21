// src/Pages/AssetScanner.jsx
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { createHardwareAsset } from "../Services/ApiServices";
import { Html5Qrcode } from "html5-qrcode";
import "../Page_styles/Scanner.css";

const AssetScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [cameras, setCameras] = useState([]);
  const [currentCamera, setCurrentCamera] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const scanner = new Html5Qrcode("scanner");
    scannerRef.current = scanner;

    Html5Qrcode.getCameras()
      .then((devices) => {
        setCameras(devices);
        if (devices.length) {
          setCurrentCamera(devices[0].id);
          startScanner(devices[0].id);
        }
      })
      .catch((err) => console.error("Camera error:", err));

    function startScanner(cameraId) {
      scanner
        .start(
          cameraId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            let parsed;
            try {
              parsed = JSON.parse(decodedText);
            } catch {
              parsed = { assetCode: decodedText };
            }
            setScannedData(parsed);
            setFormData(mapToAssetSchema(parsed));
            scanner.stop().catch(() => {});
          },
          (err) => console.warn("Scan error:", err)
        )
        .catch((err) => console.error("Start error:", err));
    }

    // restart scanner when switching camera
    if (currentCamera) {
      startScanner(currentCamera);
    }

    return () => {
      scanner.stop().catch(() => {});
      scanner.clear().catch(() => {});
    };
  }, [isMobile, currentCamera]);

  const mapToAssetSchema = (src) => ({
    assetCode: src.assetCode ?? src.serial ?? "UNKNOWN_CODE",
    assetCategory: src.assetCategory ?? src.category ?? "Uncategorized",
    assetName: src.assetName ?? src.name ?? "Unnamed Asset",
    associateUnit: src.associateUnit ?? "Default Unit",
    image: src.image ?? "https://via.placeholder.com/150",
    locationName: src.locationName ?? src.location ?? "Unknown Location",
    assetSpecification: src.assetSpecification ?? "N/A",
    assetStatus: src.assetStatus ?? "Pending",
    DOP: src.DOP ?? new Date().toISOString().split("T")[0],
    DOE: src.DOE ?? new Date().toISOString().split("T")[0],
    assetLifetime: src.assetLifetime ?? "1 year",
    purchaseFrom: src.purchaseFrom ?? "Unknown Vendor",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await createHardwareAsset(formData);
      Swal.fire("✔️ Saved", "Asset has been added successfully.", "success");
      setScannedData(null);
      setFormData({});
      scannerRef.current?.start(currentCamera); // restart scanning
    } catch {
      Swal.fire("❌ Error", "Failed to save asset.", "error");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    scannerRef.current
      .scanFile(file, true)
      .then((decodedText) => {
        let parsed;
        try {
          parsed = JSON.parse(decodedText);
        } catch {
          parsed = { assetCode: decodedText };
        }
        setScannedData(parsed);
        setFormData(mapToAssetSchema(parsed));
      })
      .catch((err) => Swal.fire("❌ Error", "Invalid QR code file", "error"));
  };

  if (!isMobile) {
    return (
      <div className="desktop-warning">
        <h2>📱 Mobile Only</h2>
        <p>This feature is available only on mobile devices.</p>
      </div>
    );
  }

  return (
    <div className="scanner-container">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="scanner-title"
      >
        Asset Scanner
      </motion.h2>

      {!scannedData ? (
        <>
          {/* Controls outside scanner */}
          <div className="scanner-controls">
            <select
              value={currentCamera || ""}
              onChange={(e) => setCurrentCamera(e.target.value)}
            >
              {cameras.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || `Camera ${cam.id}`}
                </option>
              ))}
            </select>

            <label className="upload-btn">
              Upload QR
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                hidden
              />
            </label>
          </div>

          <motion.div
            id="scanner"
            className="scanner-box"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          />
        </>
      ) : (
        <motion.div
          className="form-card"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h3>Confirm Asset Details</h3>
          <form>
            {Object.entries(formData).map(([key, value]) => (
              <div className="form-group" key={key}>
                <label>{key}</label>
                <input
                  type="text"
                  name={key}
                  value={value}
                  onChange={handleChange}
                />
              </div>
            ))}
          </form>
          <div className="actions">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="btn-primary"
            >
              Save Asset
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setScannedData(null);
                scannerRef.current?.start(currentCamera);
              }}
              className="btn-secondary"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AssetScanner;
