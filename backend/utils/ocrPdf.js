// utils/ocrPdf.js
const pdfParse = require("pdf-parse");
const ocrImage = require("./ocrImage");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process"); // for poppler tools

const ocrPdf = async (fileBuffer, filePath) => {
  try {
    console.log("➡️ Trying direct text extraction from PDF...");

    const pdfData = await pdfParse(fileBuffer);
    let extracted = pdfData.text?.trim() || "";

    if (extracted.length > 20) {
      console.log("✔ PDF extraction success (no OCR needed)");
      return extracted;
    }

    console.log("⚠ PDF has low/NO text → looks like scanned");
    console.log("➡ Attempting scanned-PDF OCR...");

    // Create PDF-to-image output directory
    const outputDir = path.join("uploads", "pdf_images");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputImage = path.join(outputDir, `${Date.now()}_page`);

    try {
      // Convert PDF → PNG using poppler
      console.log("➡ Converting PDF pages to images...");
      execSync(`pdftoppm "${filePath}" "${outputImage}" -png -r 300`);

      const files = fs.readdirSync(outputDir).filter((f) => f.includes("page"));
      if (!files.length) {
        throw new Error("PDF → image conversion failed");
      }

      let combinedText = "";

      for (const img of files) {
        const imgPath = path.join(outputDir, img);
        console.log("➡ OCR on:", imgPath);

        const pageText = await ocrImage(imgPath);
        combinedText += pageText + "\n";
      }

      if (combinedText.trim().length < 10) {
        console.warn("⚠ OCR returned very small text for scanned PDF.");
      }

      return combinedText;

    } catch (popplerErr) {
      console.warn("⚠ Poppler not available → fallback to basic OCR");
      console.warn("Poppler Error:", popplerErr.message);

      // FINAL fallback – directly run OCR on the full PDF file
      return await ocrImage(filePath);
    }

  } catch (err) {
    console.error("❌ PDF OCR Error:", err.message);
    return "";
  }
};

module.exports = ocrPdf;
