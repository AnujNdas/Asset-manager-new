// models/category.js
const mongoose = require('mongoose');

// Define the schema for Category
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Optional, if you want unique categories
  },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

