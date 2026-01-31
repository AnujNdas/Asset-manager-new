const SupportTicket = require("../models/SupportTicket");
const sendMail = require("../utils/mailer");

/**
 * CONTACT SUPPORT (Email Only)
 */
const contactSupport = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email and message are required"
      });
    }

    await sendMail({
      to: process.env.SUPPORT_ADMIN_EMAIL,
      subject: "New Contact Support Message",
      html: `
        <h3>New Support Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact support error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

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
  updateTicketStatus,
  contactSupport
}