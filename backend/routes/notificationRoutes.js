const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require("../controllers/notificationController");
const authenticateToken = require("../Middleware/Authentication-token")

router.post("/", authenticateToken(), createNotification);
router.get("/", authenticateToken(), getUserNotifications);
router.put("/:notificationId/read", authenticateToken(), markAsRead);
router.put("/markAllRead", authenticateToken(), markAllAsRead);
router.delete("/:notificationId", authenticateToken(), deleteNotification);
// routes/notification.js
router.get("/unreadCount", authenticateToken(), async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Error fetching unread count" });
  }
});


module.exports = router;
