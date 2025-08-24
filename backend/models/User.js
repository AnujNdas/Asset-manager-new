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
  bio: { type: String, default: "" },
  name: { type: String, default: "" },
  phone: { type: String, default: "" },
  country: { type: String, default: "" },
  city: { type: String, default: "" },
  postalCode: { type: String, default: "" },
  taxId: { type: String, default: "" },
});

const User = mongoose.model("user", UserSchema);
module.exports = User;
