// routes/unitRoutes.js
const express = require("express");
const {
  createUnit,
  updateUnit,
  getUnits,
  deleteUnit,
  restoreUnit
} = require("../controllers/unitControllers");

const router = express.Router();

router.post("/", createUnit);
router.get("/", getUnits);
router.put("/:id", updateUnit);
router.delete("/:id", deleteUnit);
router.patch("/:id/restore", restoreUnit);

module.exports = router;
