// utils/extractTextFromFile.js
const ocrPdf = require("./ocrPdf");
const ocrImage = require("./ocrImage");
const fs = require("fs");

const extractTextFromFile = async (file) => {
  try {
    const filePath = file.path;
    const fileBuffer = fs.readFileSync(filePath);

    const mime = file.mimetype;

    let extractedText = "";

    if (mime === "application/pdf") {
      extractedText = await ocrPdf(fileBuffer, filePath);
    } 
    else if (mime.startsWith("image/")) {
      extractedText = await ocrImage(filePath);
    } else {
      throw new Error("Unsupported file type: " + mime);
    }

    return extractedText;

  } catch (err) {
    console.error("OCR Engine Error:", err);
    return "";
  }
};

module.exports = extractTextFromFile;

