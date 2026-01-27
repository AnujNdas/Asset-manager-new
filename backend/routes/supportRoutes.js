const express = require("express");
const router = express.Router();

const {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus
} = require("../controllers/supportController");

const authenticateToken = require("../Middleware/Authentication-token");

/**
 * USER & ADMIN
 */
router.post(
  "/tickets",
  authenticateToken(["user", "admin"]),
  createTicket
);

router.get(
  "/tickets/my",
  authenticateToken(["user", "admin"]),
  getMyTickets
);

/**
 * ADMIN ONLY
 */
router.get(
  "/tickets",
  authenticateToken(["admin"]),
  getAllTickets
);

router.patch(
  "/tickets/:id",
  authenticateToken(["admin"]),
  updateTicketStatus
);

module.exports = router;
