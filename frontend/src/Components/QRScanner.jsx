import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

const QRScanner = ({ onClose }) => {
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

        // ✅ If your QR contains full URL
        if (decodedText.startsWith("http")) {
          window.location.href = decodedText;
        } else {
          // fallback → route internally
          navigate(`/track/${decodedText}`);
        }

        scanner.clear();
        onClose();
      },
      (error) => {
        // ignore scan errors
      }
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