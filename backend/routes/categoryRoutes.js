// routes/categoryRoutes.js
const express = require('express');
const { createCategory , getCategories , deleteCategory , updateCategory }= require('../controllers/categoryControllers');
const router = express.Router();

// Route to create a category
router.post('/', createCategory);

// Route to get all categories
router.get('/',getCategories);

// Route to update category 
router.put('/update' , updateCategory)

// Route to delete category 
router.delete("/:id", (req, res, next) => {
  console.log("Delete API hit for ID:", req.params.id);
  next();
}, deleteCategory);

module.exports = router;

