// models/unit.js
const mongoose = require('mongoose');

// Define the schema for Unit
const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Optional, if you want unique units
  },
}, { timestamps: true });  // Optional, adds createdAt and updatedAt fields

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;

