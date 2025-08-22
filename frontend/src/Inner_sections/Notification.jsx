import { useState } from "react";
import { FaBell, FaCheck } from "react-icons/fa";
import "../Page_styles/Notification.css"; // Import the CSS file

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Asset Assigned", message: "Laptop assigned to you.", time: "2 mins ago", read: false },
    { id: 2, title: "Return Reminder", message: "Return the borrowed projector.", time: "1 hour ago", read: false },
    { id: 3, title: "Maintenance Scheduled", message: "Printer scheduled for maintenance.", time: "Yesterday", read: true },
  ]);

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  return (
    <div className="notification-container">
      {/* Header */}
      <div className="notification-header">
        <h1 className="title"><FaBell /> Notifications</h1>
        <button onClick={markAllAsRead} className="mark-read-btn">
          <FaCheck /> Mark All as Read
        </button>
      </div>

      {/* Notification List */}
      <div className="notification-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications available</p>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`notification-item ${notification.read ? "read" : "unread"}`}
              >
                <div className="notification-content">
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <span className="time">{notification.time}</span>
                </div>
                {!notification.read && <span className="badge">New</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;

