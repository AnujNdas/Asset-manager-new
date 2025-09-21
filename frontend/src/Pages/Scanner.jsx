// src/Pages/AssetScanner.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { createHardwareAsset } from "../Services/ApiServices";
import "../Page_styles/Scanner.css";

const AssetScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) return; // ❌ prevent scanner init on desktop

    import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
      const scanner = new Html5QrcodeScanner("scanner", { fps: 10, qrbox: 250 });
      scanner.render(onScanSuccess, onScanFailure);

      function onScanSuccess(decodedText) {
        let parsed;
        try {
          parsed = JSON.parse(decodedText);
        } catch {
          parsed = { assetCode: decodedText };
        }
        setScannedData(parsed);
        setFormData(mapToAssetSchema(parsed));
        scanner.clear();
      }

      function onScanFailure(err) {
        console.warn("Scan error:", err);
      }

      return () => {
        scanner.clear().catch(() => {});
      };
    });
  }, [isMobile]);

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
    } catch {
      Swal.fire("❌ Error", "Failed to save asset.", "error");
    }
  };

  // ❌ Don't load scanner at all on desktop
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
        <motion.div
          id="scanner"
          className="scanner-box"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        />
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
              onClick={() => setScannedData(null)}
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
