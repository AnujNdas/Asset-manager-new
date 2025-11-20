const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  console.log("🔥 Cloudinary Storage Loaded");

  cloudinary,
  params: {
    folder: "assets",             // Folder name on Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

module.exports = storage;
