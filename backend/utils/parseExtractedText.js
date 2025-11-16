// utils/parseExtractedText.js
const extractByRegex = (text, regex) => {
  const match = text.match(regex);
  if (!match) return "";
  return match[2] ? match[2].trim() : match[1].trim();
};

const parseExtractedText = (licenseType, text) => {
  // OCR text cleanup
  text = text.replace(/\s+/g, " ").toLowerCase();

  let result = {
    licenseNumber: "",
    licenseName: "",
    businessName: "",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
    address: "",
    additionalFields: {}
  };

  switch (licenseType.toLowerCase()) {

    // =========================================================
    // 1️⃣ GST LICENSE
    // =========================================================
    case "gst":
      result.licenseName = "GST Registration";

      console.log("🔍 Using GST regex patterns...");

      // GSTIN (always 15-character)
      result.businessName = extractByRegex(
        text,
        /(legal name|trade name)[\s:]*([a-z0-9 .]+)/i
      );
      // Trade name (if any)
      const tradeName = extractByRegex(
        text,
        /trade name[, ]*if any\s*([a-z0-9 ,.]+)/i
      );
      if (tradeName) result.businessName = tradeName;

      // Issue date — OPTIONAL on GST certificate
      result.issueDate = extractByRegex(
        text,
        /(date of registration|registration date)\s*([0-9-/]+)/i
      );

      // Address (OCR PDFs often break formatting → capture long text)
      result.address = extractByRegex(
        text,
        /(address)\s*([a-z0-9 ,.-]+)/i
      );

      break;

    // =========================================================
    // 2️⃣ FSSAI LICENSE
    // =========================================================
    case "fssai":
      result.licenseName = "FSSAI License";
      result.licenseNumber = extractByRegex(
        text,
        /(license no|fssai no|fssai number)\s*([0-9]+)/i
      );
      result.businessName = extractByRegex(
        text,
        /(legal name|company name)\s*([a-z0-9 ,.]+)/i
      );
      result.issueDate = extractByRegex(
        text,
        /(issued on|issue date)\s*([0-9-/]+)/i
      );
      result.expiryDate = extractByRegex(
        text,
        /(valid upto|valid until|expiry date)\s*([0-9-/]+)/i
      );
      break;

    // =========================================================
    // 3️⃣ TRADE LICENSE
    // =========================================================
    case "trade":
      result.licenseName = "Trade License";
      result.businessName = extractByRegex(
        text,
        /(business name|shop name|owner)\s*([a-z0-9 ,.]+)/i
      );
      result.licenseNumber = extractByRegex(
        text,
        /(license no|tl no)\s*([a-z0-9-/]+)/i
      );
      result.issueDate = extractByRegex(
        text,
        /(issued on|date of issue)\s*([0-9-/]+)/i
      );
      result.expiryDate = extractByRegex(
        text,
        /(expiry date|valid until)\s*([0-9-/]+)/i
      );
      result.address = extractByRegex(
        text,
        /(address)\s*([a-z0-9 ,.-]+)/i
      );
      break;

    // =========================================================
    // 4️⃣ POLLUTION CERTIFICATE
    // =========================================================
    case "pollution":
      result.licenseName = "Pollution Certificate";
      result.licenseNumber = extractByRegex(
        text,
        /(certificate no|pollution no)\s*([a-z0-9]+)/i
      );
      result.issueDate = extractByRegex(
        text,
        /(issued on|date of issue)\s*([0-9-/]+)/i
      );
      result.expiryDate = extractByRegex(
        text,
        /(valid till|expiry|valid upto)\s*([0-9-/]+)/i
      );
      result.issuingAuthority = extractByRegex(
        text,
        /(issued by|authority)\s*([a-z .]+)/i
      );
      break;

    // =========================================================
    // 5️⃣ IEC LICENSE
    // =========================================================
    case "import":
    case "export":
    case "iec":
      result.licenseName = "Import Export Code (IEC)";
      result.licenseNumber = extractByRegex(
        text,
        /(iec code|iec number)\s*([0-9]+)/i
      );
      result.businessName = extractByRegex(
        text,
        /(legal name|company name)\s*([a-z0-9 ,.]+)/i
      );
      result.address = extractByRegex(
        text,
        /(address)\s*([a-z0-9 ,.-]+)/i
      );
      break;

    // =========================================================
    // DEFAULT FALLBACK
    // =========================================================
    default:
      result.additionalFields.rawTextPreview = text.substring(0, 500);
      break;
  }

  return result;
};

module.exports = parseExtractedText;
