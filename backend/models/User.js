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
  },// 🔹 Organization relationship
organizationId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Organization",
  index: true,
},

role: {
  type: String,
  enum: ["super-admin", "admin", "user" , "affiliate"], // ✅ added "super-admin" and "affiliate"
  default: "user",
},
  // Reset password fields
  resetToken: String,
  resetTokenExpiry: Date,
 // 🔹 Personal
 avatar: {
  url: { type: String, default: "" },
  publicId: { type: String, default: "" },
},

  fullName: { type: String, default: "" },
  phone: { type: String, default: "" },
  profileTitle: { type: String, default: "" },

  // 🔹 Organization
  organizationName: { type: String, default: "" },
  organizationType: {
    type: String,
    enum: ["Startup", "Enterprise", "Agency", "NGO", "Other"],
    default: "Other",
  },
  departmentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Department",
  default: null,   // important
  index: true
},
  designation: { type: String, default: "" },
  workEmail: { type: String, default: "" },

  // 🔹 Location / Compliance
  country: { type: String, default: "" },
  city: { type: String, default: "" },
  officeLocation: { type: String, default: "" },
  taxId: { type: String, default: "" },
  onboardingCompleted: {
  type: Boolean,
  default: false,
},
  // Two-Factor Authentication fields
  tfaEnabled: { type: Boolean, default: false },
  tfaOTP: { type: String },              // Store the current OTP
  tfaOTPExpiry: { type: Date },          // OTP expiration time
  lastActive: { type: Date, default: Date.now },

},{ timestamps: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;
