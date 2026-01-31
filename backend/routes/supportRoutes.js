const express = require("express");
const router = express.Router();

const {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
  contactSupport
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
/**
 * CONTACT SUPPORT (Email Only)
 * User & Admin
 */
router.post(
  "/contact",
  authenticateToken(["user", "admin"]),
  contactSupport
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
