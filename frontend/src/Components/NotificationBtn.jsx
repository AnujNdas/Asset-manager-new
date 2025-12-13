import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../Context/NotificationContext";
import "../Component_Styles/NotificationBtn.css";

const NotificationBtn = () => {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <button
      className="notification-btn"
      onClick={() => navigate("/setting/notification")}
      aria-label="Notifications"
    >
      <FaBell className="notification-icon" />

      {unreadCount > 0 && (
        <span className="notification-badge">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBtn;
