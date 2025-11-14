// utils/ocrImage.js
const Tesseract = require("tesseract.js");
const fs = require("fs");

const ocrImage = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.error("❌ Image path does NOT exist:", filePath);
      return "";
    }

    console.log("➡️ Running Tesseract on image:", filePath);

    const result = await Tesseract.recognize(filePath, "eng", {
      logger: (m) => {
        if (m.status !== "loading tesseract core") {
          console.log("OCR:", m.status, m.progress);
        }
      },
      tessjs_create_pdf: "0", // avoid huge memory usage
    });

    const text = result.data.text || "";

    if (text.trim().length < 5) {
      console.warn("⚠️ Very low OCR output!");
    }

    return text;

  } catch (err) {
    console.error("❌ Image OCR Error:", err.message);
    return "";
  }
};

module.exports = ocrImage;
