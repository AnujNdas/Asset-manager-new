// routes/categoryRoutes.js
const express = require('express');
const categoryController = require('../controllers/categoryControllers');
const router = express.Router();

// Route to create a category
router.post('/', categoryController.createCategory);

// Route to get all categories
router.get('/', categoryController.getCategories);

module.exports = router;

