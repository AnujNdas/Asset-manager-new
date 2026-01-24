const express = require("express");
const authenticateToken = require("../Middleware/Authentication-token");
const { createInvite , revokeInvite , getInvites } = require("../controllers/inviteController");

const router = express.Router();

router.post(
  "/",
  authenticateToken(["admin"]),
  createInvite
);
router.get("/", authenticateToken(["admin"]), getInvites);
router.delete("/:id", authenticateToken(["admin"]), revokeInvite);
module.exports = router;
