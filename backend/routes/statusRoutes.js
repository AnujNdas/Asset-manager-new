const express = require('express');
const { createStatus, getStatuses } = require('../controllers/statusControllers');

const router = express.Router();

// Route for creating a new status
router.post('/', createStatus);

// Route for getting all statuses
router.get('/', getStatuses);

module.exports = router;
