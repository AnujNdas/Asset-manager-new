const Notification = require("../models/Notification");

const sendNotification = async ({
  req,
  userId,
  title,
  message,
  type = "info",
  redirectUrl = null,
}) => {
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    redirectUrl,
  });

  const io = req.app.get("io");
  io.to(userId.toString()).emit("newNotification", notification);

  return notification;
};

module.exports = sendNotification;
