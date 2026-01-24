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

router.post("/", authenticateToken(["admin", "user"]), createUnit);
router.get("/", authenticateToken(["admin", "user"]), getUnits);
router.put("/:id", authenticateToken(["admin", "user"]), updateUnit);
router.delete("/:id", authenticateToken(["admin", "user"]), deleteUnit);
router.patch("/:id/restore", authenticateToken(["admin", "user"]), restoreUnit);

module.exports = router;
