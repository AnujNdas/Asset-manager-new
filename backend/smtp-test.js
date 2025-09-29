// smtp-test.js
const nodemailer = require("nodemailer");

(async () => {
  console.log("🚀 Starting SMTP test...");

  // Configure Brevo SMTP details
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // Brevo uses STARTTLS
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS,
    },
    connectionTimeout: 10000, // 10 sec timeout
  });

  try {
    console.log("⏳ Trying to connect to Brevo SMTP...");
    const result = await transporter.verify();
    console.log("✅ SMTP Connection Successful:", result);
  } catch (error) {
    console.error("❌ SMTP Connection Failed:", error);
  }

  process.exit();
})();
