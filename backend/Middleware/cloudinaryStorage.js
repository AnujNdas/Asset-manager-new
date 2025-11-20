const { CloudinaryStorage } = require("multer-storage-cloudinary");

// DEBUG LOG: Check if cloudinary file loads correctly
console.log("📁 Loading cloudinary config...");

let cloudinary;
try {
  cloudinary = require("../config/cloudinary");
  console.log("🔥 Cloudinary loaded OK:", cloudinary ? "YES" : "NO");
} catch (err) {
  console.log("❌ Cloudinary load FAILED →", err);
}

console.log("📦 Initializing Cloudinary Storage...");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "assets",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

console.log("✅ Cloudinary Storage Ready");

module.exports = storage;
