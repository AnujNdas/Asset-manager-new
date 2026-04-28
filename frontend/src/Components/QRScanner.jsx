import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

const QRScanner = ({ onClose, onScanSuccess }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        console.log("QR Result:", decodedText);

        let instanceId = decodedText;

        // ✅ If QR contains full URL → extract ID
        if (decodedText.startsWith("http")) {
          const parts = decodedText.split("/");
          instanceId = parts[parts.length - 1]; // last segment
        }

        console.log("Extracted ID:", instanceId);

        // ✅ pass ID to parent instead of redirect
        if (onScanSuccess) {
          onScanSuccess(instanceId);
        } else {
          navigate(`/track/${instanceId}`);
        }

        scanner.clear();
        onClose();
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [navigate, onClose, onScanSuccess]);

  return (
    <div className="scanner-modal">
      <div id="qr-reader" style={{ width: "100%" }} />
      <button onClick={onClose} className="btn">
        Close
      </button>
    </div>
  );
};
export default QRScanner;