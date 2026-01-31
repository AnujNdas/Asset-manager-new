const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in", // IMPORTANT for India
  port: 465,
  secure: true,        // MUST be true
  auth: {
    user: process.env.MAIL_USER, // full Zoho email
    pass: process.env.MAIL_PASS  // Zoho app password
  }
});

const sendMail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: `"Support Team" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html
  });
};

module.exports = sendMail;
    