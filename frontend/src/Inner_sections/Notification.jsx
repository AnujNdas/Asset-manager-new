import { useState, useEffect , useRef } from "react";
import { FaBell, FaCheck } from "react-icons/fa";
import axios from "axios";
import { io } from "socket.io-client";
import "../Page_styles/Notification.css"

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId"); // ✅ Store this during login

  const socketRef = useRef()

useEffect(() => {
  if (!userId) return;

  socketRef.current = io("https://asset-manager-new.onrender.com");
  socketRef.current.on("connect", () => {
  socketRef.current.emit("joinRoom", userId);
});


  socketRef.current.on("newNotification", (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  });

  axios
    .get(`https://asset-manager-new.onrender.com/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setNotifications(res.data))
    .catch(console.error);

  return () => socketRef.current.disconnect();
}, [userId]);


  useEffect(() => {
  console.log("Notifications updated:", notifications);
}, [notifications]);


  const markAllAsRead = async () => {
    await axios.put(
      `https://asset-manager-new.onrender.com/api/notifications/markAllRead/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h1>
          <FaBell /> Notifications
        </h1>
        <button onClick={markAllAsRead} className="mark-read-btn">
          <FaCheck /> Mark All as Read
        </button>
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <p>No notifications available</p>
        ) : (
          <ul>
            {notifications.map((n) => (
              <li key={n._id} className={n.isRead ? "read" : "unread"}>
                <div className="notification-item">
                  <h3>{n.title}</h3>
                  <p>{n.message}</p>
                  <div className="notification-footer">
                   <span>{new Date(n.time || n.createdAt).toLocaleString()}</span>

                    {!n.isRead && <span className="badge">New</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
