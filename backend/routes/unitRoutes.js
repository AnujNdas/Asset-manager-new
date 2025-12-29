// routes/unitRoutes.js
const express = require("express");
const {
  createUnit,
  updateUnit,
  getUnits,
  deleteUnit,
  restoreUnit
} = require("../controllers/unitControllers");
const authenticateToken = require("../Middleware/Authentication-token");
const router = express.Router();

router.post("/", authenticateToken(["admin", "super-admin"]), createUnit);
router.get("/", getUnits);
router.put("/:id", authenticateToken(["admin", "super-admin"]), updateUnit);
router.delete("/:id", authenticateToken(["admin", "super-admin"]), deleteUnit);
router.patch("/:id/restore", authenticateToken(["admin", "super-admin"]), restoreUnit);

module.exports = router;
