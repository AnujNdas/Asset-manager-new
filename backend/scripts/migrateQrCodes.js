const mongoose = require("mongoose");
const QRCode = require("qrcode");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});
const cloudinary = require("../config/cloudinary");

// 🔥 Import your model
const AssetInstance = require("../models/AssetInstance");

const migrateQRCodes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB connected");

    const instances = await AssetInstance.find({
      assetType: "hardware",
      $or: [
        { qrCode: { $exists: false } },
        { "qrCode.url": { $exists: false } }
      ]
    });

    console.log(`🔍 Found ${instances.length} instances to update`);

    for (let instance of instances) {
      try {
        const trackingUrl = `${process.env.FRONTEND_URL}/track/${instance._id}`;

        // 🔥 Generate QR
        const qrImage = await QRCode.toDataURL(trackingUrl);
        console.log("ENV CHECK:", {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
            api_secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING",
        });
        // ☁️ Upload to Cloudinary
        const uploadRes = await cloudinary.uploader.upload(qrImage, {
          folder: "asset_qr_codes",
          public_id: `qr-${instance._id}`,
        });

        // 💾 Save
        instance.qrCode = {
          url: uploadRes.secure_url,
          public_id: uploadRes.public_id,
        };

        await instance.save();

        console.log(`✅ Updated: ${instance._id}`);
      } catch (err) {
        console.error(`❌ Failed for ${instance._id}:`, JSON.stringify(err, null, 2));
      }
    }

    console.log("🎉 Migration completed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
};

migrateQRCodes();