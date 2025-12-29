// routes/statusRoutes.js
const express = require("express");
const {
  createStatus,
  updateStatus,
  getStatuses,
  deleteStatus,
  restoreStatus
} = require("../controllers/statusControllers");
const authenticateToken = require("../Middleware/Authentication-token");
const router = express.Router();

router.post("/", authenticateToken(["admin", "super-admin"]), createStatus);
router.get("/", getStatuses);
router.put("/:id", authenticateToken(["admin", "super-admin"]), updateStatus);
router.delete("/:id", authenticateToken(["admin", "super-admin"]), deleteStatus);
router.patch("/:id/restore", authenticateToken(["admin", "super-admin"]), restoreStatus); // optional

module.exports = router;
