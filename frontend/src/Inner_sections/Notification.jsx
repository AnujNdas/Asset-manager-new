import { FaBell, FaCheck } from "react-icons/fa";
import { useNotifications } from "../Context/NotificationContext";
import "../Page_styles/Notification.css";

const NotificationPage = () => {
  const { notifications, markAllAsRead } = useNotifications();

  return (
    <div className="notification-container">
      <div className="notification-header">
        {/* <h1>
           Notifications
        </h1> */}
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
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
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
