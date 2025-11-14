// utils/extractTextFromFile.js
const fs = require("fs");
const path = require("path");
const ocrPdf = require("./ocrPdf");
const ocrImage = require("./ocrImage");

const extractTextFromFile = async (file) => {
  try {
    console.log("\n===== OCR ENGINE DEBUG =====");

    if (!file) {
      console.error("❌ No file object received.");
      return "";
    }

    const filePath = file.path;
    const mime = file.mimetype;

    console.log("File info:");
    console.log(" - path:", filePath);
    console.log(" - type:", mime);
    console.log(" - size:", file.size);

    if (!filePath || !fs.existsSync(filePath)) {
      console.error("❌ File path missing or file does not exist.");
      return "";
    }

    let extractedText = "";

    // 🔹 PDF OCR
    if (mime === "application/pdf") {
      console.log("➡️ Running PDF OCR...");
      const fileBuffer = fs.readFileSync(filePath);

      extractedText = await ocrPdf(fileBuffer, filePath);
    }

    // 🔹 Image OCR
    else if (mime.startsWith("image/")) {
      console.log("➡️ Running IMAGE OCR...");
      extractedText = await ocrImage(filePath);
    }

    // ❌ Unsupported type
    else {
      console.error("❌ Unsupported MIME type: " + mime);
      return "";
    }

    // 🔎 Debug result
    if (!extractedText || extractedText.trim().length < 5) {
      console.warn("⚠️ OCR returned very short text!");
    } else {
      console.log("✔️ OCR text length:", extractedText.length);
    }

    console.log("===== OCR ENGINE END =====\n");

    return extractedText;

  } catch (err) {
    console.error("❌ OCR Engine Fatal Error:", err);
    return "";
  }
};

module.exports = extractTextFromFile;
