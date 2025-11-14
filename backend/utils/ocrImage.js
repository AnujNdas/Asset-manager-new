// utils/ocrImage.js
const Tesseract = require("tesseract.js");

const ocrImage = async (filePath) => {
  try {
    const result = await Tesseract.recognize(filePath, "eng", {
      logger: (m) => console.log("OCR Progress:", m),
    });

    return result.data.text;
  } catch (err) {
    console.error("Image OCR Error:", err);
    return "";
  }
};

module.exports = ocrImage;

