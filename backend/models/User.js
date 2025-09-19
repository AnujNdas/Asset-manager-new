const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
role: {
  type: String,
  enum: ["super-admin", "admin", "user"], // ✅ added "super-admin"
  default: "user",
},
  // Reset password fields
  resetToken: String,
  resetTokenExpiry: Date,
  
  bio: { type: String, default: "" },
  name: { type: String, default: "" },
  phone: { type: String, default: "" },
  country: { type: String, default: "" },
  city: { type: String, default: "" },
  postalCode: { type: String, default: "" },
  taxId: { type: String, default: "" },

  // Two-Factor Authentication fields
  tfaEnabled: { type: Boolean, default: false },
  tfaOTP: { type: String },              // Store the current OTP
  tfaOTPExpiry: { type: Date },          // OTP expiration time
});

const User = mongoose.model("user", UserSchema);
module.exports = User;
