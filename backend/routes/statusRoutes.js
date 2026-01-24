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

router.post("/", authenticateToken(["admin", "user"]), createStatus);
router.get("/", authenticateToken(["admin", "user"]), getStatuses);
router.put("/:id", authenticateToken(["admin", "user"]), updateStatus);
router.delete("/:id", authenticateToken(["admin", "user"]), deleteStatus);
router.patch("/:id/restore", authenticateToken(["admin", "user"]), restoreStatus); // optional

module.exports = router;
