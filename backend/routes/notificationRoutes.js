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

router.post("/", authenticateToken(), createNotification);
router.get("/", authenticateToken(), getUserNotifications);
router.put("/:notificationId/read", authenticateToken(), markAsRead);
router.put("/markAllRead", authenticateToken(), markAllAsRead);
router.delete("/:notificationId", authenticateToken(), deleteNotification);


module.exports = router;
