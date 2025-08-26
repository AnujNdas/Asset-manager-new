import { useState, useEffect } from "react";
import { FaBell, FaCheck } from "react-icons/fa";
import axios from "axios";
import { io } from "socket.io-client";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId"); // ✅ Store this during login

  const socket = io("https://asset-manager-new.onrender.com"); // Backend URL

  useEffect(() => {
    if (!userId) return;

    // ✅ Fetch initial notifications
    axios
      .get(`https://asset-manager-new.onrender.com/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error("Error fetching notifications", err));

    // ✅ Join user-specific socket room
    socket.emit("joinRoom", userId);

    // ✅ Listen for new notifications
    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const markAllAsRead = async () => {
    await axios.put(
      `https://asset-manager-new.onrender.com/api/notifications/markAllRead/${userId}`,
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
              <li key={n._id} className={n.read ? "read" : "unread"}>
                <div className="notification-item">
                  <h3>{n.title}</h3>
                  <p>{n.message}</p>
                  <div className="notification-footer">
                   <span>{new Date(n.time || n.createdAt).toLocaleString()}</span>

                    {!n.read && <span className="badge">New</span>}
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
