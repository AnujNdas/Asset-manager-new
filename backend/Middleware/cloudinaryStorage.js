const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
 try {
  const cloudTest = require("../config/cloudinary");
  console.log("🔥 Cloudinary loaded OK", cloudTest ? "YES" : "NO");
} catch (err) {
  console.log("❌ Cloudinary load FAILED →", err);
}


  cloudinary,
  params: {
    folder: "assets",             // Folder name on Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

module.exports = storage;
