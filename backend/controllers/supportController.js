const SupportTicket = require("../models/SupportTicket");

/**
 * CREATE SUPPORT TICKET (User/Admin)
 */
const createTicket = async (req, res) => {
  try {
    const { subject, issueType, description, priority } = req.body;

    if (!subject || !issueType || !description) {
      return res.status(400).json({
        message: "Subject, issue type, and description are required"
      });
    }

    const ticket = await SupportTicket.create({
      subject,
      issueType,
      description,
      priority: priority || "Medium",
      userId: req.user.id,
      organizationId: req.user.organizationId
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ message: "Failed to create support ticket" });
  }
};

/**
 * GET MY TICKETS (User)
 */
const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      userId: req.user.id,
      organizationId: req.user.organizationId
    }).sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error("Get my tickets error:", error);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
};

/**
 * GET ALL TICKETS (Admin)
 */
const getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      organizationId: req.user.organizationId
    })
      .populate("userId", "username email")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error("Get all tickets error:", error);
    res.status(500).json({ message: "Failed to fetch all tickets" });
  }
};

/**
 * UPDATE TICKET STATUS (Admin)
 */
const updateTicketStatus = async (req, res) => {
  try {
    const { status, adminRemark, priority } = req.body;

    const ticket = await SupportTicket.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.user.organizationId
      },
      {
        status,
        adminRemark,
        priority
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Update ticket error:", error);
    res.status(500).json({ message: "Failed to update ticket" });
  }
};
module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus
}