// utils/ocrPdf.js
const pdfParse = require("pdf-parse");
const ocrImage = require("./ocrImage");
const fs = require("fs");
const path = require("path");

const ocrPdf = async (fileBuffer, filePath) => {
  try {
    // 1️⃣ Try normal PDF text extraction
    const pdfData = await pdfParse(fileBuffer);
    let text = pdfData.text ? pdfData.text.trim() : "";

    if (text.length > 20) {
      console.log("PDF text extracted without OCR");
      return text;
    }

    // 2️⃣ Fallback: convert PDF pages into images for OCR
    console.log("PDF seems scanned → running OCR...");

    // 👉 OPTIONAL: convert PDF to image using "pdf-poppler" or "pdf2img"
    // For simplicity: running OCR directly on file if it's scanned
    return await ocrImage(filePath);

  } catch (err) {
    console.error("PDF OCR Error:", err);
    return "";
  }
};

module.exports = ocrPdf;

