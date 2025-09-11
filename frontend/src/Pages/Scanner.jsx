import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Swal from "sweetalert2";
import { createHardwareAsset } from "../Services/ApiServices";
import "../Page_styles/Scanner.css";

const AssetScanner = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const qrRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsMobile(/android|iphone|ipad|ipod/i.test(ua));
  }, []);

  useEffect(() => {
    if (!isMobile || !scannerRef.current) return;

    const html5QrCode = new Html5Qrcode("qr-scanner");
    qrRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        processScan,
        (err) => console.log("Scan error:", err)
      )
      .catch(console.error);

    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, [isMobile, scannerRef.current]);

  const processScan = (decoded) => {
    let data;
    try {
      data = JSON.parse(decoded);
    } catch {
      data = { assetCode: decoded };
    }
    setPrefill(mapToAssetSchema(data));
    qrRef.current?.stop();
  };

  const mapToAssetSchema = (src) => ({
    assetCode: src.assetCode ?? src.serial ?? "",
    assetCategory: src.assetCategory ?? src.category ?? "",
    barcodeNumber: src.barcodeNumber ?? src.assetCode ?? "",
    assetName: src.assetName ?? src.name ?? "",
    associateUnit: src.associateUnit ?? "",
    image: src.image ?? "",
    locationName: src.locationName ?? src.location ?? "",
    assetSpecification: src.assetSpecification ?? "",
    assetStatus: src.assetStatus ?? "Pending",
    DOP: src.DOP ?? "",
    DOE: src.DOE ?? "",
    assetLifetime: src.assetLifetime ?? "",
    purchaseFrom: src.purchaseFrom ?? "",
    PMD: src.PMD ?? "",
  });

  const handleSave = async (finalData) => {
    try {
      await createHardwareAsset(finalData);
      Swal.fire("✔️ Saved", "Asset has been added successfully.", "success");
      setPrefill(null);
      qrRef.current?.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        processScan
      );
    } catch {
      Swal.fire("❌ Error", "Failed to save asset.", "error");
    }
  };

  if (!isMobile) {
    return <div className="scanner-fallback">Scanner works only on mobile.</div>;
  }

  return (
    <div className="scanner-container">
      <h2>Mobile Asset Scanner</h2>

      {!prefill && <div id="qr-scanner" ref={scannerRef} className="qr-scanner-box" />}

      {prefill && (
        <div className="confirmation-card">
          <h3>Confirm Asset Details</h3>
          <dl>
            {Object.entries(prefill).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v || "—"}</dd>
              </div>
            ))}
          </dl>
          <div className="actions">
            <button onClick={() => handleSave(prefill)}>Save</button>
            <button onClick={() => setPrefill(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetScanner;
