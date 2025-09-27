import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../Context/NotificationContext";

const NotificationBtn = () => {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <button className="controls" onClick={() => navigate("setting/notification")}>
      <FaBell style={{ color: "#2463eb", fontSize: "0.9rem" }} />
      {unreadCount > 0 && <span className="badge" style={{color: "red",borderRadius : "50%" , background : "yellow" , fontSize : "10px"}}>{unreadCount}</span>}
    </button>
  );
};

export default NotificationBtn;
