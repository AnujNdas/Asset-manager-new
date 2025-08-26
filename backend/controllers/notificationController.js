const Notification = require("../models/Notification");

const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, redirectUrl } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ error: "userId, title, and message are required" });
    }

    const newNotification = await Notification.create({
      userId,
      title,
      message,
      type: type || "info",
      redirectUrl: redirectUrl || null
    });

    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");
    const socketId = userSocketMap[userId];

    if (socketId) {
      io.to(socketId).emit("newNotification", newNotification);
    }

    res.status(201).json(newNotification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updated = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    if (!updated) return res.status(404).json({ error: "Notification not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const deleted = await Notification.findByIdAndDelete(notificationId);
    if (!deleted) return res.status(404).json({ error: "Notification not found" });
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
