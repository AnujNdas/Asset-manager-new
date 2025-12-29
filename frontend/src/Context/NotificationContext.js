// src/context/NotificationContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  
  // Fetch initial notifications + unread count
  useEffect(() => {
    if (!userId || !token) return;

    axios
      .get(`${process.env.REACT_APP_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNotifications(res.data))
      .catch(console.error);

    axios
      .get(`${process.env.REACT_APP_API_URL}/notifications/unreadCount`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUnreadCount(res.data.count || 0))
      .catch(console.error);

    // setup socket
    socketRef.current = io(process.env.REACT_APP_API_URL);
    socketRef.current.emit("joinRoom", userId);

socketRef.current.on("newNotification", (notification) => {
  console.log("🔥 REALTIME EVENT RECEIVED:", notification);
  setNotifications((prev) => [notification, ...prev]);
  setUnreadCount((prev) => prev + 1);

  // 🔥 SHOW POPUP
  showToast(notification);
});

    return () => socketRef.current.disconnect();
  }, [userId, token]);
  const showToast = (notification) => {
  const { title, message, type } = notification;

  switch (type) {
    case "success":
      toast.success(`${title}: ${message}`);
      break;
    case "error":
      toast.error(`${title}: ${message}`);
      break;
    case "warning":
      toast(`${title}: ${message}`, { icon: "⚠️" });
      break;
    default:
      toast(`${title}: ${message}`);
  }
};

  // Mark all as read
  const markAllAsRead = async () => {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/notifications/markAllRead`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // Mark one as read
  const markAsRead = async (id) => {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/notifications/${id}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllAsRead, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
