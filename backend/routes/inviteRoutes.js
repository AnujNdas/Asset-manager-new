const express = require("express");
const authenticateToken = require("../Middleware/Authentication-token");
const tenantMiddleware = require("../Middleware/tenantMiddleware");
const requireActiveSubscription = require("../Middleware/requireActiveSubscription");

const { createInvite, revokeInvite, getInvites } = require("../controllers/inviteController");

const router = express.Router();

/* ----------------------------------
   PROTECTED: ADMIN + ACTIVE SUBSCRIPTION
----------------------------------- */
router.use(
  authenticateToken(["admin"]),
  tenantMiddleware,
  requireActiveSubscription
);

router.post("/", createInvite);
router.get("/", getInvites);
router.delete("/:id", revokeInvite);

module.exports = router;