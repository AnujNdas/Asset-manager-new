// routes/unitRoutes.js
const express = require('express');
const { createUnit , getUnits , deleteUnit } = require('../controllers/unitControllers');
const router = express.Router();

// Route to create a unit
router.post('/', createUnit);

// Route to get all units
router.get('/', getUnits);

// Route to delete unit
router.delete('/:id', deleteUnit);

module.exports = router;

