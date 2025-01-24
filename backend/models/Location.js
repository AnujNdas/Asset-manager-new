// models/location.js
const mongoose = require('mongoose');

// Define the schema for Location
const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Optional, if you want unique locations
  },
}, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;

  
