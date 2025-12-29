const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["info", "warning", "alert" , "success" , "error"],
    default: "info"
  },
  isRead: { type: Boolean, default: false },
  redirectUrl: { type: String }, // optional link for navigation
  createdAt: { type: Date, default: Date.now }
});

// Add index for faster queries
NotificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
