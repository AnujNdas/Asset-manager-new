// routes/unitRoutes.js
const express = require('express');
const unitController = require('../controllers/unitControllers');
const router = express.Router();

// Route to create a unit
router.post('/', unitController.createUnit);

// Route to get all units
router.get('/', unitController.getUnits);

module.exports = router;

