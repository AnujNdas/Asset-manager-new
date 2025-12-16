// routes/statusRoutes.js
const express = require("express");
const {
  createStatus,
  updateStatus,
  getStatuses,
  deleteStatus,
  restoreStatus
} = require("../controllers/statusControllers");

const router = express.Router();

router.post("/", createStatus);
router.get("/", getStatuses);
router.put("/:id", updateStatus);
router.delete("/:id", deleteStatus);
router.patch("/:id/restore", restoreStatus); // optional

module.exports = router;
