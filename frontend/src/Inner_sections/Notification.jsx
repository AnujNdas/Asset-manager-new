import { FaBell, FaCheck } from "react-icons/fa";
import { useNotifications } from "../Context/NotificationContext";
import "../Page_styles/Notification.css";
import {
  FiBell,
  FiBellOff,
  FiInbox,
  FiCheckCircle,
  FiList,
  FiClock,
} from "react-icons/fi";
const NotificationPage = () => {
  const { notifications, markAllAsRead } = useNotifications();

  return (

<div className="notification-container">

  {/* ==========================================
      NOTIFICATION HEADER
  ========================================== */}

  <div className="notification-header">

    <div className="notification-heading">

      <span className="notification-heading-icon">
        <FiBell />
      </span>

      <div className="notification-heading-text">
        <h2>Notifications</h2>
        <p>
          Stay updated with important activities and alerts.
        </p>
      </div>

    </div>


    <div className="notification-header-actions">

      <span className="notification-count">
        <FiInbox />
        {notifications.filter((n) => !n.isRead).length} Unread
      </span>

      <button
        type="button"
        onClick={markAllAsRead}
        className="mark-read-btn"
        disabled={
          notifications.length === 0 ||
          notifications.every((n) => n.isRead)
        }
      >
        <FiCheckCircle />
        <span>Mark All as Read</span>
      </button>

    </div>

  </div>


  {/* ==========================================
      NOTIFICATION LIST SECTION
  ========================================== */}

  <div className="notification-list">

    <div className="notification-list-header">

      <div className="notification-list-heading">

        <span className="notification-list-icon">
          <FiList />
        </span>

        <div>
          <h3>All Notifications</h3>
          <p>
            View your recent notifications and updates.
          </p>
        </div>

      </div>

      <span className="notification-total-count">
        {notifications.length} Total
      </span>

    </div>


    {/* ==========================================
        EMPTY STATE
    ========================================== */}

    {notifications.length === 0 ? (

      <div className="notification-empty">

        <span className="notification-empty-icon">
          <FiBellOff />
        </span>

        <h4>No notifications available</h4>

        <p>
          You're all caught up. New notifications
          will appear here.
        </p>

      </div>

    ) : (

      <ul className="notification-items">

        {notifications.map((n) => (

          <li
            key={n._id}
            className={`notification-card ${
              n.isRead ? "read" : "unread"
            }`}
          >

            <div className="notification-item">

              {/* NOTIFICATION ICON */}

              <span className="notification-item-icon">
                {n.isRead ? (
                  <FiCheckCircle />
                ) : (
                  <FiBell />
                )}
              </span>


              {/* NOTIFICATION CONTENT */}

              <div className="notification-content">

                <div className="notification-title-row">

                  <h3>{n.title}</h3>

                  {!n.isRead && (
                    <span className="notification-new-badge">
                      <span className="notification-new-dot" />
                      New
                    </span>
                  )}

                </div>


                <p className="notification-message">
                  {n.message}
                </p>


                <div className="notification-footer">

                  <span className="notification-date">
                    <FiClock />
                    {new Date(n.createdAt).toLocaleString()}
                  </span>

                  <span
                    className={`notification-read-status ${
                      n.isRead ? "is-read" : "is-unread"
                    }`}
                  >
                    {n.isRead ? "Read" : "Unread"}
                  </span>

                </div>

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
