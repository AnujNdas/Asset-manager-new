// utils/parseExtractedText.js

const extractByRegex = (text, regex) => {
  const match = text.match(regex);
  return match ? match[1].trim() : "";
};

const parseExtractedText = (licenseType, text) => {
  text = text.replace(/\s+/g, " ").toLowerCase(); // clean text

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

    // -------------------------------------------------
    // 1️⃣ GST LICENSE
    // -------------------------------------------------
    case "gst":
      result.licenseName = "GST Registration";
      result.licenseNumber = extractByRegex(text, /(gstin|gst no|gst number)[:\s]*([a-z0-9]+)/i);
      result.businessName = extractByRegex(text, /(legal name|trade name)[:\s]*([a-z0-9 .]+)/i);
      result.issueDate = extractByRegex(text, /(date of registration)[:\s]*([\d-/]+)/i);
      result.address = extractByRegex(text, /(address)[:\s]*([a-z0-9 ,.-]+)/i);
      break;

    // -------------------------------------------------
    // 2️⃣ FSSAI LICENSE
    // -------------------------------------------------
    case "fssai":
      result.licenseName = "FSSAI License";
      result.licenseNumber = extractByRegex(text, /(license no|fssai number|fssai no)[:\s]*([0-9]+)/i);
      result.businessName = extractByRegex(text, /(legal name|company name)[:\s]*([a-z0-9 .]+)/i);
      result.issueDate = extractByRegex(text, /(issued on|issue date)[:\s]*([\d-/]+)/i);
      result.expiryDate = extractByRegex(text, /(valid upto|valid until|expiry date)[:\s]*([\d-/]+)/i);
      break;

    // -------------------------------------------------
    // 3️⃣ TRADE LICENSE / SHOP LICENSE
    // -------------------------------------------------
    case "trade":
      result.licenseName = "Trade License";
      result.businessName = extractByRegex(text, /(business name|shop name|owner)[:\s]*([a-z0-9 .]+)/i);
      result.licenseNumber = extractByRegex(text, /(license no|tl no)[:\s]*([a-z0-9-/]+)/i);
      result.issueDate = extractByRegex(text, /(date of issue|issued on)[:\s]*([\d-/]+)/i);
      result.expiryDate = extractByRegex(text, /(expiry date|valid until)[:\s]*([\d-/]+)/i);
      result.address = extractByRegex(text, /(address)[:\s]*([a-z0-9 ,.-]+)/i);
      break;

    // -------------------------------------------------
    // 4️⃣ POLLUTION CERTIFICATE
    // -------------------------------------------------
    case "pollution":
      result.licenseName = "Pollution Certificate";
      result.licenseNumber = extractByRegex(text, /(certificate no|pollution no)[:\s]*([a-z0-9]+)/i);
      result.issueDate = extractByRegex(text, /(date of issue|issued on)[:\s]*([\d-/]+)/i);
      result.expiryDate = extractByRegex(text, /(valid till|expiry|valid upto)[:\s]*([\d-/]+)/i);
      result.issuingAuthority = extractByRegex(text, /(issued by|authority)[:\s]*([a-z .]+)/i);
      break;

    // -------------------------------------------------
    // 5️⃣ IMPORT/EXPORT LICENSE (IEC)
    // -------------------------------------------------
    case "import":
    case "export":
    case "iec":
      result.licenseName = "Import Export Code (IEC)";
      result.licenseNumber = extractByRegex(text, /(iec code|iec number)[:\s]*([0-9]+)/i);
      result.businessName = extractByRegex(text, /(legal name|company name)[:\s]*([a-z0-9 .]+)/i);
      result.address = extractByRegex(text, /(address)[:\s]*([a-z0-9 ,.-]+)/i);
      break;

    // -------------------------------------------------
    // DEFAULT FALLBACK
    // -------------------------------------------------
    default:
      result.additionalFields.rawTextPreview = text.substring(0, 500);
      break;
  }

  return result;
};

module.exports = parseExtractedText;

