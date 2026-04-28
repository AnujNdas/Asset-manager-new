import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QRScanner = ({ onClose, onScanSuccess }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

scanner.render(
  (decodedText) => {
    console.log("QR Result:", decodedText);

    let instanceId = null;

    try {
      // ✅ handle full URL QR
      if (decodedText.startsWith("http")) {
        const url = new URL(decodedText);
        instanceId = url.searchParams.get("instance");
      } else {
        // fallback: QR contains only instanceId
        instanceId = decodedText;
      }

      if (!instanceId) {
        console.warn("No instanceId found in QR");
        return;
      }

      // ✅ send to parent instead of navigating
      if (onScanSuccess) {
        onScanSuccess(instanceId);
      }

    } catch (err) {
      console.error("QR parse error:", err);
    }

    scanner.clear();
    onClose();
  },
  () => {}
);

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [navigate, onClose]);

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