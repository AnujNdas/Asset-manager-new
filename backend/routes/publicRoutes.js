const express = require("express");
const router = express.Router();
const { getPublicTrackedInstance } = require("../controllers/publicControllers");
router.get("/tracking/:id", getPublicTrackedInstance);

module.exports = router;