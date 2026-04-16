// testQR.js
const QRCode = require("qrcode");

(async () => {
  const qr = await QRCode.toDataURL("test-qr");
  console.log(qr);
})();