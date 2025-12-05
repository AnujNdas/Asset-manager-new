// routes/categoryRoutes.js
const express = require('express');
const { createCategory , getCategories , deleteCategory }= require('../controllers/categoryControllers');
const router = express.Router();

// Route to create a category
router.post('/', createCategory);

// Route to get all categories
router.get('/',getCategories);

router.delete("/:id", deleteCategory);

module.exports = router;

