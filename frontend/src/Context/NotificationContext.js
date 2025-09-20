// src/context/NotificationContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef(null);
  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

  // Fetch initial notifications + unread count
  useEffect(() => {
    if (!userId || !token) return;

    axios
      .get("https://asset-manager-new.onrender.com00/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNotifications(res.data))
      .catch(console.error);

    axios
      .get("https://asset-manager-new.onrender.com00/api/notifications/unreadCount", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUnreadCount(res.data.count || 0))
      .catch(console.error);

    // setup socket
    socketRef.current = io("https://asset-manager-new.onrender.com00");
    socketRef.current.emit("joinRoom", userId);

    socketRef.current.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socketRef.current.disconnect();
  }, [userId, token]);

  // Mark all as read
  const markAllAsRead = async () => {
    await axios.put(
      "https://asset-manager-new.onrender.com00/api/notifications/markAllRead",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // Mark one as read
  const markAsRead = async (id) => {
    await axios.put(
      `https://asset-manager-new.onrender.com00/api/notifications/${id}/read`,
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
