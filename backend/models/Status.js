const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,  // Ensuring no duplicates for status names
    trim: true,    // Trimming extra spaces from the name
  },
}, { timestamps: true });

module.exports = mongoose.model('Status', statusSchema);

