const express = require("express");
const router = express.Router();
const { getPublicTrackedInstance } = require("../controllers/publicControllers");
router.get("/:id", getPublicTrackedInstance);

module.exports = router;