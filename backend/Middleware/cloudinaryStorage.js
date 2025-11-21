const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "assets",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],

      // Always generate unique public_id
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

module.exports = storage;
