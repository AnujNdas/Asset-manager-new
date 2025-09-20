import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../Context/NotificationContext";

const NotificationBtn = () => {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <button className="controls" onClick={() => navigate("setting/notification")}>
      <FaBell style={{ color: "#7870f7", fontSize: "20px" }} />
      {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
    </button>
  );
};

export default NotificationBtn;
