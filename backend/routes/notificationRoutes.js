const express = require("express");
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require("../controllers/notificationController");
const authenticateToken = require("../Middleware/Authentication-token")

// Create new notification
router.post("/", authenticateToken, createNotification);

// Get all notifications for logged-in user
router.get("/", authenticateToken, getUserNotifications);

// Mark a specific notification as read
router.put("/:notificationId/read", authenticateToken, markAsRead);

// Mark all notifications as read
router.put("/markAllRead", authenticateToken, markAllAsRead);

// Delete a specific notification
router.delete("/:notificationId", authenticateToken, deleteNotification);

module.exports = router;
