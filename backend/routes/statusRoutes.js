const express = require('express');
const { createStatus, getStatuses , deleteStatus } = require('../controllers/statusControllers');

const router = express.Router();

// Route for creating a new status
router.post('/', createStatus);

// Route for getting all statuses
router.get('/', getStatuses);

// Route for deleting status
router delete('/:id', deleteStatus); 

module.exports = router;
